import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from '../utils/stamps.model'

/** Owner-only account support stored below the canonical User. */
export interface UserAccount extends FireuxStamped {
  id: string
  email: string
  preferences: {
    language: string
    theme: 'system' | 'light' | 'dark'
    email_security_alerts: boolean
    share_usage_analytics: boolean
  }
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

export const UserAccountModel: UserAccount = {
  id: '',
  email: '',
  preferences: {
    language: 'en',
    theme: 'system',
    email_security_alerts: true,
    share_usage_analytics: false,
  },
  terms: {
    version: '',
    accepted_at: null,
  },
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type UserAccountCreateInput = Omit<
  UserAccount,
  'id' | 'created' | 'updated'
>
export type UserAccountUpdateInput = Partial<UserAccountCreateInput>
