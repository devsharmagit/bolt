import { LlmMessage } from '@/types/chat.type';
import { Step, FileItem } from '@/types/file.type';

const CHAT_SESSIONS_KEY = 'bolt_chat_sessions';
const CURRENT_SESSION_KEY = 'bolt_current_session';
const INITIAL_PROMPT_KEY = 'bolt_initial_prompt';

export interface ChatSession {
  id: string;
  title: string;
  initialPrompt: string;
  messages: LlmMessage[];
  steps: Step[];
  files: FileItem[];
  createdAt: number;
  updatedAt: number;
}

export const chatStorage = {
  // Create a new chat session
  createSession: (initialPrompt: string): string => {
    if (typeof window === 'undefined') return '';
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const newSession: ChatSession = {
        id: sessionId,
        title: initialPrompt.slice(0, 50) + (initialPrompt.length > 50 ? '...' : ''),
        initialPrompt,
        messages: [],
        steps: [],
        files: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const sessions = chatStorage.getAllSessions();
      sessions.unshift(newSession); // Add to beginning
      localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      
      return sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      return '';
    }
  },

  // Get all chat sessions
  getAllSessions: (): ChatSession[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CHAT_SESSIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  },

  // Get a specific session
  getSession: (sessionId: string): ChatSession | null => {
    if (typeof window === 'undefined') return null;
    try {
      const sessions = chatStorage.getAllSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  // Update current session
  updateSession: (sessionId: string, updates: Partial<Omit<ChatSession, 'id' | 'createdAt'>>) => {
    if (typeof window === 'undefined') return;
    try {
      const sessions = chatStorage.getAllSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex !== -1) {
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          ...updates,
          updatedAt: Date.now(),
        };
        localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  },

  // Delete a session
  deleteSession: (sessionId: string) => {
    if (typeof window === 'undefined') return;
    try {
      const sessions = chatStorage.getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(filtered));
      
      // If deleting current session, clear it
      const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY);
      if (currentSessionId === sessionId) {
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  },

  // Get current session ID
  getCurrentSessionId: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  },

  // Set current session ID
  setCurrentSessionId: (sessionId: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    } catch (error) {
      console.error('Failed to set current session:', error);
    }
  },

  // Clear current session
  clearCurrentSession: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear current session:', error);
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
