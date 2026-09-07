import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? WidenLiteral<U>[]
        : T extends Record<string, unknown>
          ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
          : T

export type BlankStatus = 'active' | 'archived'

export const BlankStorage = {
  rootCollection: 'blanks',
} as const

export const BlankModel = {
  id: '',
  management: FireuxEntityManagementDefaults,
  name: '',
  slug: '',
  status: 'active' as BlankStatus,
  created: {
    at: {} as FireuxStamped['created']['at'],
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FireuxStamped['updated']['at'],
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Blank = Omit<WidenLiteral<typeof BlankModel>, 'management'> & {
  management: FireuxEntityManagement
}
