// ModuleTypes - Strict interface for all dashboard modules
import type { FC } from 'react';

export interface ModuleDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  encrypted: boolean;
  Component: FC;
}
