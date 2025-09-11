/**
 * CoreUser model — canonical identity across FireUX.
 * Used by both king (global) and tenant apps.
 */
import type { FirebaseTimestamp } from '../../types/firebase'

export interface CoreUser {
  id: string                  // Auth UID and Firestore doc ID
  email: string
  display_name?: string
  avatar?: string
  userOf: string[]            // e.g. ['misebox-app', 'niederhorn']
  adminOf: string[]           // e.g. ['niederhorn']
  created_at: string | Date | FirebaseTimestamp
  updated_at?: string | Date | FirebaseTimestamp
  profiles?: string[]         // optional profile badges (global)
}

export namespace CoreUser {
  export namespace Card {
    export interface Pill {
      display_name?: string
      email: string
      avatar?: string
    }
    export interface Cell {
      id: string
      email: string
      display_name?: string
      avatar?: string
      adminOf: string[]
      userOf: string[]
      created_at: string | Date | FirebaseTimestamp
    }
    export interface Profile {
      id: string
      email: string
      display_name?: string
      avatar?: string
      userOf: string[]
      adminOf: string[]
      created_at: string | Date | FirebaseTimestamp
      updated_at?: string | Date | FirebaseTimestamp
      profiles?: string[]
    }
  }
}
