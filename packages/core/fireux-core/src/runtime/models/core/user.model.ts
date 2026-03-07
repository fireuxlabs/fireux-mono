// FILE: packages/core/fireux-core/src/runtime/models/core/user.model.ts

import type { FirebaseTimestamp } from '../../../types/firebase'
import type { FireuxStamped } from './meta.model'
import type { UserNotification } from './supporting/user'

/**
 * Core Firestore user document
 * Path: /users/<userId>
 *
 * Canon rules:
 * - Empty string means unset
 * - Arrays always exist
 * - Runtime object is the single source of truth
 */

export interface User {
  id: string
  display_name: string
  avatar: string
  handle: string
  email: string
  bio: string
  profiles: string[]
  userOf: string[]
  adminOf: string[]
  notifications: UserNotification[]
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
}

// Runtime canonical shape
export const User: User = {
  id: '',
  display_name: '',
  avatar: '',
  handle: '',
  email: '',
  bio: '',
  profiles: [],
  userOf: [],
  adminOf: [],
  notifications: [],
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

/**
 * App-specific user overlay
 * Path: /apps/<appId>/users/<userId>
 */
export interface AppUser {
  id: string
  role: 'user' | 'admin'
  console_enabled: boolean
  console_scopes: string[]
  notifications: UserNotification[]
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
}

export const AppUser: AppUser = {
  id: '',
  role: 'user',
  console_enabled: false,
  console_scopes: [],
  notifications: [],
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}
