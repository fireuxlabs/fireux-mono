import type { FirebaseTimestamp } from '../../types/firebase'

export interface CoreUser {
  /** Canonical user id (== Firebase Auth UID and doc id) */
  id: string

  /** Global identity */
  email: string
  display_name?: string
  avatar?: string
  handle?: string // global username/handle

  /** App membership (global view) */
  userOf: string[] // e.g. ['misebox-app', 'niederhorn']
  adminOf: string[] // e.g. ['niederhorn']

  /** Global profile badges (what you ARE globally) */
  profiles?: string[] // e.g. ['chef','supplier','employer','professional']

  /** Timestamps */
  created_at: string | Date | FirebaseTimestamp
  updated_at?: string | Date | FirebaseTimestamp
}

export namespace CoreUser {
  export namespace Card {
    // Minimal identity chip/pill
    export type Pill = Pick<
      CoreUser,
      'display_name' | 'email' | 'avatar' | 'handle'
    >

    // Compact list/cell representation
    export type Cell = Pick<
      CoreUser,
      | 'id'
      | 'email'
      | 'display_name'
      | 'avatar'
      | 'adminOf'
      | 'userOf'
      | 'created_at'
      | 'handle'
    >

    // Full profile card
    export type Profile = Pick<
      CoreUser,
      | 'id'
      | 'email'
      | 'display_name'
      | 'avatar'
      | 'userOf'
      | 'adminOf'
      | 'created_at'
      | 'updated_at'
      | 'profiles'
      | 'handle'
    >
  }
}
