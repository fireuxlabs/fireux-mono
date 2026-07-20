// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: type Blank App access as a support record.
import type {
  FireuxAppAccessRecord,
  FireuxAppScope,
  FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model'

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
export type Blank = Partial<FireuxStamped> &
  FireuxAppScope & {
    id?: string
    name: string
    slug: string
    status: BlankStatus
    operator_ids: string[]
  }

export type AppBlank = Partial<FireuxAppAccessRecord> & {
  id?: string
  blank_id: string
}
