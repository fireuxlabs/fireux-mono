import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System
 * Storage: root canonical model
 * Root path: /modules/<moduleId>
 * Runtime face: optional project-managed facade if humans are managing module composition
 *
 * Decision note:
 * - Module stays root-only until real scoped stored state appears.
 * - A runtime surface can compose or inspect modules through a facade without inventing a second stored model.
 * - If that decision changes later, update the models README first, then this file.
 */
export const ModuleStorage = {
  shape: 'public/root',
  path: 'modules/{moduleId}',
  collection: 'modules',
  idParam: 'moduleId',
} as const

export const ModuleModel = {
  id: '',
  name: '',
  team: '',

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Module = {
  [K in keyof typeof ModuleModel]: (typeof ModuleModel)[K]
}

export type ModuleCreateInput = Omit<Module, 'created' | 'updated'>
export type ModuleUpdateInput = Partial<Omit<Module, 'id' | 'created' | 'updated'>>
