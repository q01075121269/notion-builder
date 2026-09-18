// src/plugins/modules/geminiExecutor.ts
// Gemini API ?? ?? ? ?? ??? (65? ???)

import type { AIPluginRequest } from '../types';
import type { GeminiConversationResponse } from '../../types/notion';
import { MASTER_SYSTEM_PROMPT } from './geminiPrompts';

export async function executeGeminiCall(req: AIPluginRequest): Promise<GeminiConversationResponse> {
  const apiKey = (req.apiKey || '').trim();
  const model = req.options?.model || 'gemini-3.6-flash';
  const targetModel = model.replace(/^models\//, '').trim();

  let promptText = `[??? ??]: "${req.prompt}"`;
  if (req.currentTemplate) {
    promptText += `\n\n[?? ??? ??]:\n${JSON.stringify(req.currentTemplate, null, 2)}`;
  }

  const parts: any[] = [{ text: promptText }];
  req.attachedFiles?.filter(f => f.category === 'image' && f.base64).forEach(img => {
    parts.push({ inlineData: { mimeType: img.mimeType || 'image/png', data: img.base64 } });
  });

  const body = {
    contents: [{ role: 'user', parts }],
    systemInstruction: { parts: [{ text: MASTER_SYSTEM_PROMPT }] },
    generationConfig: { temperature: 0.7, topP: 0.95 }
  };

  let res = await fetch(`/api/gemini?model=${targetModel}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey },
    body: JSON.stringify(body)
  }).catch(() => null);

  if (!res || !res.ok) {
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    res = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API ?? ?? (${res.status}): ${errorText.slice(0, 100)}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  return parseGeminiOutput(rawText);
}

function parseGeminiOutput(rawText: string): GeminiConversationResponse {
  try {
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.mode === 'CREATE_NEW' || parsed.mode === 'PATCH_UPDATE') return parsed;
  } catch {}
  return { mode: 'CONVERSATION_GUIDE', explanation: rawText };
}
