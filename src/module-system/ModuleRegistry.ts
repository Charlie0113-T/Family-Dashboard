// ModuleRegistry - Central registry for all dashboard modules
// Modules self-register here and the dashboard renders them dynamically

import type { ModuleDefinition } from './ModuleTypes';

const modules: Map<string, ModuleDefinition> = new Map();

export const ModuleRegistry = {
  /** Register a module definition */
  register(module: ModuleDefinition): void {
    if (modules.has(module.id)) {
      console.warn('[ModuleRegistry] Module "' + module.id + '" is already registered.');
      return;
    }
    modules.set(module.id, module);
  },

  /** Get a module by ID */
  get(id: string): ModuleDefinition | undefined {
    return modules.get(id);
  },

  /** Get all registered modules */
  getAll(): ModuleDefinition[] {
    return Array.from(modules.values());
  },

  /** Check if a module is registered */
  has(id: string): boolean {
    return modules.has(id);
  },
};
