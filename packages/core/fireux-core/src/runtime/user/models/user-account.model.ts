import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../../models/utils/stamps.model.ts'

/** Owner-only account support stored below the canonical User. */
export interface UserAccount extends FireuxStamped {
  email: string
  terms: {
    version: string
    accepted_at: FirebaseTimestamp | null
  }
}

export const UserAccountStorage = {
  shape: 'scoped',
  path: 'users/{userId}/private/account',
  collection: 'private',
  document: 'account',
  parent: 'user',
  idParam: 'userId',
} as const

export type CurrentUserAccountResponse = {
  ok: true
  account: UserAccount | null
}
