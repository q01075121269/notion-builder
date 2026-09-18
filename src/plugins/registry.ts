// src/plugins/registry.ts
// AI ???? ?? ????? (?? ??, ??, ??? ??)

import type { IAIPlugin, AIPluginRequest, AIPluginResponse, PluginCapability } from './types';
import { safeExecutePlugin } from './errorIsolation';

export class AIPluginRegistry {
  private plugins = new Map<string, IAIPlugin>();
  private defaultPluginId = 'gemini';

  /** ? AI ???? ?? */
  register(plugin: IAIPlugin): void {
    this.plugins.set(plugin.id, plugin);
    console.log(`[PluginRegistry] ???? ?? ??: ${plugin.name} (${plugin.id})`);
  }

  /** AI ???? ?? */
  unregister(pluginId: string): boolean {
    const deleted = this.plugins.delete(pluginId);
    if (deleted) {
      console.log(`[PluginRegistry] ???? ?? ??: ${pluginId}`);
    }
    return deleted;
  }

  /** ?? ???? ?? */
  get(pluginId: string): IAIPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /** ??? ?? ???? ?? ?? */
  getAll(): IAIPlugin[] {
    return Array.from(this.plugins.values());
  }

  /** ?? ??(Capability)? ???? ???? ?? */
  findByCapability(cap: PluginCapability): IAIPlugin[] {
    return this.getAll().filter(p => p.capabilities.includes(cap));
  }

  /** ?? ???? ID ?? */
  setDefaultPlugin(pluginId: string): void {
    if (this.plugins.has(pluginId)) {
      this.defaultPluginId = pluginId;
    }
  }

  /** ???? ?? ?? */
  async execute(request: AIPluginRequest, targetPluginId?: string): Promise<AIPluginResponse> {
    const targetId = targetPluginId || this.defaultPluginId;
    const plugin = this.get(targetId);

    if (!plugin) {
      return {
        success: false,
        pluginId: targetId,
        errorMessage: `???? '${targetId}'?(?) ?? ? ????.`,
      };
    }

    return safeExecutePlugin(plugin, request);
  }
}

export const pluginRegistry = new AIPluginRegistry();
