// packages/core/fireux-core/src/runtime/models/core/user.model.ts
import type { FirebaseTimestamp as TsLike } from '../../types/firebase'

export interface User {
  id: string
  display_name: string
  avatar?: string
}

/** As-is docs (keep these as you already have them) */
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

/** 🔹 Minimal unified view that the composable returns */
export interface UserUnified {
  id: string
  core: CoreUserDoc | null
  app?: AppUserDoc | null
}

/** (Keep your UnifiedUser.Card.* if you use them elsewhere) */
export namespace UnifiedUser {
  export namespace Card {
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
}
