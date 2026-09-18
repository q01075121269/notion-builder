// src/services/gemini.ts
// ???? ??? ?? ??? (?? ?? 100% ?? ??? ??)

import type { NotionTemplate, GeminiConversationResponse } from '../types/notion';
import type { GeminiModelType, ChatMessage } from '../types/chat';
import type { AttachedFile } from '../types/fileAttachment';
import { pluginRegistry } from '../plugins';

export async function processConversationWithGemini(
  prompt: string,
  apiKey: string,
  currentTemplate: NotionTemplate | null,
  model: GeminiModelType = 'gemini-1.5-flash',
  attachedFiles: AttachedFile[] = [],
  chatHistory: ChatMessage[] = [],
  targetPluginId = 'gemini'
): Promise<GeminiConversationResponse> {
  // ??? ???? ?????? ?? ?? ?? (?? ?? ??)
  const response = await pluginRegistry.execute({
    prompt,
    apiKey,
    currentTemplate,
    attachedFiles,
    chatHistory,
    options: { model }
  }, targetPluginId);

  if (!response.success) {
    throw new Error(response.errorMessage || 'AI ???? ?? ? ??? ??????.');
  }

  return response.result as GeminiConversationResponse;
}

export async function generateNotionTemplate(
  prompt: string,
  apiKey: string,
  model: GeminiModelType = 'gemini-1.5-flash'
): Promise<NotionTemplate> {
  const result = await processConversationWithGemini(prompt, apiKey, null, model);
  if (result.mode === 'CREATE_NEW') return result.template;
  if (result.mode === 'PATCH_UPDATE') return result.updated_template;
  throw new Error('???? ???? ?????.');
}

export function getCoverImageUrl(query = 'workspace'): string {
  const images = [
    'https://images.unsplash.com/photo-1507842229451-7f01be8860ee?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
  ];
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = (hash << 5) - hash + query.charCodeAt(i);
    hash |= 0;
  }
  return images[Math.abs(hash) % images.length];
}
