import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: System
 * Storage: root canonical model
 * Root path: /modules/<moduleId>
 * Console face: optional project-console facade if humans are managing module composition
 *
 * Decision note:
 * - Module stays root-only until real scoped stored state appears.
 * - A console can compose or inspect modules through a facade without inventing a second stored model.
 * - If that decision changes later, update the models README first, then this file.
 */
export const Module = {
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
  [K in keyof typeof Module]: (typeof Module)[K]
}

export type ModuleDoc = Omit<Module, 'id'>
