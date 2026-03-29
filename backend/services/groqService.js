// services/groqService.js
const Groq = require('groq-sdk');

// Initialize the Groq client with the API key from your .env file
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates a health report using Groq AI.
 * @param {object} userData - An object containing user health data.
 * @param {number} userData.age - User's age.
 * @param {string} userData.gender - User's gender.
 * @param {number} userData.height - User's height in cm.
 * @param {number} userData.weight - User's weight in kg.
 * @param {number} userData.bmi - User's calculated BMI.
 * @param {string} userData.bmiCategory - User's BMI category.
 * @param {number} userData.bmr - User's calculated BMR.
 * @returns {Promise<string>} The AI-generated health report as a string.
 */
exports.generateAIReport = async ({ age, gender, height, weight, bmi, bmiCategory, bmr }) => {
    // This is the prompt template from the Master Development Guide.
    // We dynamically insert the user's data into this prompt.
    const prompt = `
Generate a concise health consultation report for the following user.
HARD LIMITS: Maximum 350-450 words total, 6 sections max. Use short sentences.
Use bullet points (max 4 per section). Avoid repeating information across sections.
Do not provide medical diagnoses. Focus on general wellness, prevention, and lifestyle improvements.

User Profile:
- Age: ${age} years
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Body Mass Index (BMI): ${bmi} (${bmiCategory})
- Basal Metabolic Rate (BMR): ${bmr} calories/day

Provide these sections, each with up to 4 bullets:
1.  **Health Status Overview** – 2-3 bullet summary based on metrics.
2.  **Body Composition (BMI Insight)** – what BMI means; keep to 2 bullets.
3.  **Nutrition (Compact)** – 3-4 bullets. If you include a sample day, list just meal names with 1 short phrase each (no long descriptions, no calorie parentheses).
4.  **Exercise Plan** – cardio, strength, flexibility with weekly frequency and duration.
5.  **Lifestyle Habits** – sleep, stress, hydration.
6.  **Next Steps & Goals** – simple, realistic goals.

Output strictly in Markdown with headings and short bullet lists only.
`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            // We recommend Llama 3 8b for a good balance of speed and quality for this task.
            model: 'llama-3.1-8b-instant', 
            max_tokens: 900,
        });

        // Return the content of the AI's response
        return chatCompletion.choices[0]?.message?.content || 'Error: Could not generate AI report.';

    } catch (error) {
        console.error("Error calling Groq AI:", error);
        // In case of an API error, we return a user-friendly error message.
        return "We're sorry, but the AI report could not be generated at this time. Please try again later.";
    }
};