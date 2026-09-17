import type { NotionTemplate } from './notion';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessageAttachment {
  name: string;
  category: string;
  sizeFormatted: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  templateData?: NotionTemplate;
  isLoading?: boolean;
  error?: string;
  attachments?: ChatMessageAttachment[];
}

export type GeminiModelType = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash';
