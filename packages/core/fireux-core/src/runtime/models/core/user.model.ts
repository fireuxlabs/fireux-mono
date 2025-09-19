// packages/core/fireux-core/src/runtime/models/core/user.model.ts
import type { FirebaseTimestamp as TsLike } from '../../types/firebase'

/** 🔹 Unified User (core + app) */
export interface User {
  id: string
  display_name?: string
  avatar?: string
  core: CoreUserDoc | null
  app?: AppUserDoc | null
}

/** As-is docs (unchanged) */
export interface CoreUserDoc {
  id?: string
  display_name?: string
  avatar?: string
  handle?: string
  email?: string
  userOf?: string[]
  adminOf?: string[]
  global_profiles?: string[]
  created_at?: TsLike
  updated_at?: TsLike
}

export interface AppUserDoc {
  id?: string
  display_name?: string
  avatar?: string
  handle?: string
  role?: 'user' | 'admin'
  app_profiles?: string[]
  created_at?: TsLike
  updated_at?: TsLike
}

/** 🔹 Shapes for rendering cards */
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
    created_at?: TsLike
    updated_at?: TsLike
  }
}
