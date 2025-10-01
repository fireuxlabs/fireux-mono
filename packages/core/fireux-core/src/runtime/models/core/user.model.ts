import type { FirebaseTimestamp } from '../types/firebase'

/** 🔹 Unified User (flattened app-over-core view + partitioned refs) */
export interface User {
  id: string
  // flattened convenience (computed at runtime from core/app)
  display_name?: string
  avatar?: string
  profiles?: string[] // e.g. ['chef', 'professional']

  core: CoreUserDoc | null
  app?: AppUserDoc | null
}

/** Global user doc: core-users/{uid} */
export interface CoreUserDoc {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
  userOf?: string[]
  adminOf?: string[]
  profiles?: string[] // ← only this, not "global_profiles"
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/** App user doc: apps/{appId}/users/{uid} */
export interface AppUserDoc {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
  role?: 'user' | 'admin'
  profiles?: string[] // ← only this, not "app_profiles"
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/** 🔹 Card-friendly shapes */
export namespace UserCard {
  export interface Pill {
    id: string
    display_name: string
    avatar?: string
    role?: 'user' | 'admin'
    handle?: string
  }
  export interface Cell extends Pill {
    profiles?: string[]
  }
  export interface Profile extends Cell {
    created_at?: FirebaseTimestamp
    updated_at?: FirebaseTimestamp
  }
}
