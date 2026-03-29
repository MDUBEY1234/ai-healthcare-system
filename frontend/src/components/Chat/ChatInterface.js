// src/components/Chat/ChatInterface.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import ScrollToBottom from 'react-scroll-to-bottom';
import MessageBubble from './MessageBubble'; // Import new component
import LoadingDots from '../UI/LoadingDots'; // Import new component
import './ChatInterface.css';

const ChatInterface = ({ isFullScreen = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const { token, user } = useAuth();
  const userName = user?.name || 'there';

  useEffect(() => {
    setMessages([{
        sender: 'ai',
        content: `Hello ${userName}! Ask me anything about your latest health report or general wellness topics.`,
        timestamp: new Date()
    }]);
  }, [userName]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;
    const userMessage = { sender: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      if (!token) {
        throw new Error('Not authenticated');
      }
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const body = { message: inputMessage, conversationId: conversationId };
      const response = await axios.post(`${BASE_URL}/api/chat/message`, body, config);
      const aiMessage = response.data.aiMessage;
      setMessages(prev => [...prev, aiMessage]);
      if (!conversationId) {
        setConversationId(response.data.conversationId);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = { sender: 'ai', content: "Sorry, I'm having trouble connecting. Please try again later.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`chat-container${isFullScreen ? ' chat-container--fullscreen' : ''}`}>
      <div className="chat-header"><h3>AI Health Assistant</h3></div>
      
      <ScrollToBottom className="chat-messages">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} /> // Use the new component
        ))}
        {isLoading && <LoadingDots />} {/* Show loading dots when waiting for AI */}
      </ScrollToBottom>
      
      <div className="chat-input-area">
        <input 
          type="text"
          className="chat-input"
          placeholder="Ask a health-related question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
          disabled={isLoading}
        />
        <button className="send-button" onClick={sendMessage} disabled={isLoading}>
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;