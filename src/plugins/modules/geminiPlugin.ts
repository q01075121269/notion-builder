// src/plugins/modules/geminiPlugin.ts
// Google Gemini AI ?? ?? ???? (?? ????? ??)

import type { IAIPlugin, AIPluginRequest, AIPluginResponse, PluginCapability } from '../types';
import { executeGeminiCall } from './geminiExecutor';

export class GeminiPlugin implements IAIPlugin {
  readonly id = 'gemini';
  readonly name = 'Google Gemini AI';
  readonly version = '1.5.0';
  readonly capabilities: PluginCapability[] = [
    'TEMPLATE_BUILD',
    'CONVERSATION',
    'DOCUMENT_PARSING'
  ];

  validateConfig(apiKey?: string): boolean {
    return Boolean(apiKey && apiKey.trim().length > 0);
  }

  async execute(request: AIPluginRequest): Promise<AIPluginResponse> {
    if (!this.validateConfig(request.apiKey)) {
      throw new Error('Gemini API ?? ???? ?????. ?? ???? API ?? ??? ???.');
    }

    try {
      const result = await executeGeminiCall(request);
      return {
        success: true,
        pluginId: this.id,
        result,
        metadata: {
          modelName: request.options?.model || 'gemini-3.6-flash',
        }
      };
    } catch (err: any) {
      throw new Error(`Gemini ?? ??: ${err?.message || '? ? ?? ??'}`);
    }
  }
}
