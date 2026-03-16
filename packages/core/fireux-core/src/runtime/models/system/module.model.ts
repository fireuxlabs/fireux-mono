import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../core/meta.model'

/**
 * Entity Class: Root
 *
 * Canonical Path: /modules/<moduleId>
 *
 * Module is the minimal capability record used for runtime composition.
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
export type ModuleResolved = Module
