// src/plugins/errorIsolation.ts
// AI ???? ?? ?? ? ?? ??? (Circuit Breaker & Fallback)

import type { AIPluginRequest, AIPluginResponse, IAIPlugin } from './types';

export class PluginExecutionError extends Error {
  pluginId: string;
  cause?: unknown;

  constructor(pluginId: string, message: string, cause?: unknown) {
    super(`[${pluginId}] ?? ??: ${message}`);
    this.name = 'PluginExecutionError';
    this.pluginId = pluginId;
    this.cause = cause;
  }
}

/**
 * ????? ???? ???? ??? ???? ??? ??? ?????.
 */
export async function safeExecutePlugin(
  plugin: IAIPlugin,
  request: AIPluginRequest,
  timeoutMs = 30000
): Promise<AIPluginResponse> {
  const startTime = Date.now();

  try {
    // 1. ???? ???? ???? ?? ?? (Race)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`?? ?? ?? (${timeoutMs / 1000}?)`)), timeoutMs)
    );

    const response = await Promise.race([
      plugin.execute(request),
      timeoutPromise
    ]);

    return {
      ...response,
      metadata: {
        ...response.metadata,
        latencyMs: Date.now() - startTime,
      }
    };
  } catch (error: any) {
    console.error(`[PluginIsolation] ${plugin.name}(${plugin.id}) ?? ?? ??:`, error);

    // 2. ?? ?? ? ?? ??? ?? ?? ??? ?? ?? ??
    return {
      success: false,
      pluginId: plugin.id,
      errorMessage: error?.message || '? ? ?? AI ???? ??? ??????.',
      metadata: {
        latencyMs: Date.now() - startTime,
      }
    };
  }
}
