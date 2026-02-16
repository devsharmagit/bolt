import { LlmMessage } from '@/types/chat.type';

const CHAT_HISTORY_KEY = 'bolt_chat_history';
const INITIAL_PROMPT_KEY = 'bolt_initial_prompt';

export const chatStorage = {
  // Save chat history
  saveHistory: (messages: LlmMessage[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  },

  // Load chat history
  loadHistory: (): LlmMessage[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  },

  // Clear chat history
  clearHistory: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  },

  // Save initial prompt
  saveInitialPrompt: (prompt: string) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(INITIAL_PROMPT_KEY, prompt);
    } catch (error) {
      console.error('Failed to save initial prompt:', error);
    }
  },

  // Load initial prompt
  loadInitialPrompt: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const prompt = sessionStorage.getItem(INITIAL_PROMPT_KEY);
      if (prompt) {
        sessionStorage.removeItem(INITIAL_PROMPT_KEY);
      }
      return prompt;
    } catch (error) {
      console.error('Failed to load initial prompt:', error);
      return null;
    }
  },
};
