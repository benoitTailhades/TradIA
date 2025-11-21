export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export type Language = 'en' | 'fr';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  language: Language;
}