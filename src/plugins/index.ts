// src/plugins/index.ts
// AI ???? ??? ?? ??? ? ?? ???? ?? ??

import { pluginRegistry } from './registry';
import { GeminiPlugin } from './modules/geminiPlugin';
import { NapkinPlugin } from './modules/napkinPlugin';

// ?? ???? ??
export function initializePlugins(): void {
  const gemini = new GeminiPlugin();
  const napkin = new NapkinPlugin();

  pluginRegistry.register(gemini);
  pluginRegistry.register(napkin);
  pluginRegistry.setDefaultPlugin('gemini');

  console.log('[Plugins] AI ??? ???? ??? ??? ?? (Gemini, Napkin AI ??)');
}

// ?? ??? ??
initializePlugins();

export * from './types';
export * from './registry';
export * from './errorIsolation';
export * from './modules/geminiPlugin';
export * from './modules/napkinPlugin';
