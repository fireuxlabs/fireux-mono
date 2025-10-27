import type { FirebaseTimestamp } from '../../types/firebase'
import type { Pill as PillModel } from '../../types/pill.model'

/** ------------------------------------------------------------------
 *  USER (core flattened + optional tenant overlay)
 *  Firestore Location: europe-west6
 *  ------------------------------------------------------------------ */
export interface User {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
  bio?: string
  profiles?: string[]
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp

  /** Core membership */
  userOf?: string[]
  adminOf?: string[]

  /** Overlay from tenant (if present) */
  role?: 'user' | 'admin'
  appUser?: AppUser | null
}

/** ------------------------------------------------------------------
 *  TENANT APP USER (minimal)
 *  ------------------------------------------------------------------ */
export interface AppUser {
  id: string
  role: 'user' | 'admin'
  creator_id: string
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/** ------------------------------------------------------------------
 *  UI SHAPES (aligned with Pill protocol)
 *  ------------------------------------------------------------------ */
export type UserPillProps = PillModel.Props & { to: string }
export type UserToPillMapper = (u: User) => UserPillProps

export namespace UserCard {
  export interface Pill extends UserPillProps {
    id: string
    role?: 'user' | 'admin'
  }

  export interface Cell extends Pill {
    profiles?: string[]
  }

  export interface Profile extends Cell {
    bio?: string
    email?: string
    created_at?: FirebaseTimestamp
    updated_at?: FirebaseTimestamp
  }
}
