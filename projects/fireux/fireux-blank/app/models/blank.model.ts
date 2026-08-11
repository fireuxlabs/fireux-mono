// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: type Blank App access as a support record.
// Concurrent edit — 2026-07-21 23:22 CEST — Console family alignment: keep Blank access exclusively in same-id App support.
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { FireuxAppAccessRecordModel } from 'fireux-core/runtime/models/utils/console-entity.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown>
    ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

export type BlankStatus = 'active' | 'archived'

export const BlankStorage = {
  rootCollection: 'blanks',
  appCollection: 'blanks',
} as const

/**
 * Blank is the smallest console-backed root target used to test the console spine.
 *
 * Canon:
 * - root truth: blanks/{blankId}
 * - app console scope: apps/{appId}/blanks/{blankId}
 * - demo targets are static, selectable, and read-only
 * - no test mode, no operations, no child records
 */
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

export const AppBlankModel = {
  ...FireuxAppAccessRecordModel,
  blank_id: '',
} as const

export type AppBlank = WidenLiteral<typeof AppBlankModel>

export type BlankSurface = Blank &
  Pick<AppBlank, 'operator_ids' | 'team_ids' | 'join_requests'>
