// packages/core/fireux-core/src/runtime/models/core/user.model.ts
import type { FirebaseTimestamp } from '../types/firebase'

/** 🔹 Unified User (flattened app-over-core view + partitioned refs) */
export interface User {
  id: string
  // flattened convenience (computed at runtime from core/app)
  display_name?: string
  avatar?: string

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
  global_profiles?: string[]
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/** App user doc: apps/{appId}/users/{uid} */
export interface AppUserDoc {
  id: string
  display_name: string
  avatar: string
  handle?: string
  role?: 'user' | 'admin'
  app_profiles?: string[]
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
    app_profiles?: string[]
    global_profiles?: string[]
  }
  export interface Profile extends Cell {
    created_at?: FirebaseTimestamp
    updated_at?: FirebaseTimestamp
  }
}
