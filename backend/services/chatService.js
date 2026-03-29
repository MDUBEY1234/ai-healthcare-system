// services/chatService.js
const Groq = require('groq-sdk');
const HealthReport = require('../models/HealthReport');
const ChatConversation = require('../models/ChatConversation');
const { v4: uuidv4 } = require('uuid'); // To generate unique message IDs

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class ChatService {
  // Ensure concise output regardless of model verbosity
  formatConcise(text, wantsDetailed) {
    try {
      if (wantsDetailed) return text;
      if (!text) return text;
      const hasBullets = /(^|\n)\s*[-*•]/.test(text);
      if (hasBullets) {
        // Keep only the first 3 bullet lines, clamp each to 12 words
        const lines = text.split(/\n+/)
          .map(l => l.trim())
          .filter(l => l && /^[-*•]/.test(l));
        const kept = lines.slice(0, 3).map(l => {
          const withoutMarker = l.replace(/^[-*•]\s*/, '');
          const words = withoutMarker.split(/\s+/);
          const short = words.slice(0, 12).join(' ');
          return `- ${short}${words.length > 12 ? '…' : ''}`;
        });
        return kept.join('\n') + "\nSay 'more' for details.";
      }

      // Otherwise: take first 2 sentences, hard cap at 50 words
      const normalized = text.replace(/\s+/g, ' ').trim();
      const sentenceSplit = normalized.split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
      let trimmed = sentenceSplit.slice(0, 2).join(' ');
      const words = trimmed.split(/\s+/);
      if (words.length > 50) {
        trimmed = words.slice(0, 50).join(' ') + '…';
      }
      if (!/more/i.test(trimmed)) trimmed += " Say 'more' for details.";
      return trimmed;
    } catch (_) {
      return text;
    }
  }
  // Helper to get the latest health report summary for context
  async getLatestHealthContext(userId) {
    const latestReport = await HealthReport.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestReport) {
      return { 
        reportSummary: "No health report on file.", 
        keyRecommendations: "N/A",
        fullReport: null 
      };
    }
    
    // In a real scenario, you'd have a more robust summary. For now, we'll create a simple one.
    const summary = `User's last report from ${latestReport.createdAt.toDateString()} indicates a BMI of ${latestReport.bmi}.`;
    return {
      reportSummary: summary,
      keyRecommendations: latestReport.reportFormat?.keyRecommendations?.join(', ') || "See full report for details.",
      fullReport: latestReport // Pass the full report for detailed data
    };
  }

  // Main function to generate an AI chat response
  async generateAIResponse(userMessage, userId, conversation) {
    const { reportSummary, keyRecommendations, fullReport } = await this.getLatestHealthContext(userId);

    const recentMessages = conversation.messages.slice(-5).map(m => `${m.sender}: ${m.content}`).join('\n');

    // Determine response length: default to concise unless user asks for more details
    const wantsDetailed = /\b(more|details?|explain|elaborate|why|how|long|full|comprehensive)\b/i.test(userMessage || '');

    const guidance = wantsDetailed
      ? `Guidelines for Response:
- Be conversational and supportive.
- Provide a structured but readable answer (short sections or bullets).
- Include practical, actionable tips grounded in the user's data.
- Do NOT give medical diagnoses. If asked about symptoms, recommend consulting a doctor.
Response:`
      : `Guidelines for Response:
- Be conversational and supportive.
- Keep it short and crisp: 2–4 sentences, approximately 80 words max.
- If multiple tips are needed, use 2–3 short bullet points.
- End with a brief call to action like “Say ‘more’ for details.”
- Do NOT give medical diagnoses. If asked about symptoms, recommend consulting a doctor.
Response:`;

    const chatPrompt = `
You are a professional and friendly health consultant AI. Reply based on the user's health profile and conversation history.

User's Health Profile:
- Age: ${fullReport?.age || 'N/A'}
- Gender: ${fullReport?.gender || 'N/A'}
- Height: ${fullReport?.height || 'N/A'} cm
- Weight: ${fullReport?.weight || 'N/A'} kg
- BMI: ${fullReport?.bmi || 'N/A'}

Latest Health Report Summary:
${reportSummary}

Key Recommendations from Report:
${keyRecommendations}

Recent Chat History:
${recentMessages}

User's Question: "${userMessage}"

${guidance}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: wantsDetailed
          ? 'Provide helpful, structured guidance. Stay within 6–10 short sentences or brief bullets.'
          : 'Be brief. STRICT LIMIT: at most 2 short sentences (<=50 words total) OR up to 3 bullets (each <=12 words). End with: Say \'more\' for details.' },
        { role: 'user', content: chatPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      // Encourage brevity by limiting tokens for concise responses
      max_tokens: wantsDetailed ? 600 : 80,
    });

    const raw = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
    return this.formatConcise(raw, wantsDetailed);
  }

  // Saves a message to a conversation
  async saveMessage(conversationId, sender, content, messageType = 'text') {
    const message = {
      messageId: uuidv4(),
      sender,
      content,
      messageType,
      timestamp: new Date()
    };

    await ChatConversation.updateOne(
      { _id: conversationId },
      { 
        $push: { messages: message },
        $set: { lastActivity: new Date() }
      }
    );
    return message;
  }
  
  // Creates a new conversation
  async createConversation(userId, firstMessageContent) {
      const firstMessage = {
          messageId: uuidv4(),
          sender: 'user',
          content: firstMessageContent,
          timestamp: new Date()
      };
      
      const conversation = await ChatConversation.create({
          userId,
          messages: [firstMessage],
          conversationTitle: firstMessageContent.substring(0, 40) + '...'
      });
      
      return conversation;
  }
}

module.exports = new ChatService();