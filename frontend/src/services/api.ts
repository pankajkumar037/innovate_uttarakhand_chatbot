import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://innovate-uttarakhand-chatbot.onrender.com';




const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
}

export interface ChatHistory {
  session_id: string;
  messages: Array<{
    user_message: string;
    bot_response: string;
    timestamp: string;
  }>;
}

export const chatAPI = {
  async sendMessage(message: string, sessionId?: string | null): Promise<ChatResponse> {
    try {
      const response = await api.post<ChatResponse>('/chat', {
        message,
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  },

  async getChatHistory(sessionId: string): Promise<ChatHistory> {
    try {
      const response = await api.get<ChatHistory>(`/chat/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw new Error('Failed to get chat history');
    }
  },

  async uploadPDF(file: File): Promise<{ message: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<{ message: string }>('/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw new Error('Failed to upload PDF');
    }
  },

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await api.get<{ status: string; timestamp: string }>('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw new Error('Failed to check health');
    }
  },
};

export default api;
