import type { FirebaseTimestamp } from '../../types/firebase.ts'

/** ------------------------------------------------------------------
 *  Base: shared fields across core and app user documents
 *  Keep this small and stable so downstream code can rely on it.
 *  ------------------------------------------------------------------ */
export interface BaseUserDoc {
  /** Firestore document id; consistent across scopes */
  readonly id: string
  /** Human-friendly identifiers */
  display_name: string
  avatar: string
  handle?: string
  email?: string
  /** Product-agnostic role tags */
  profiles?: string[]
  /** System timestamps */
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/** ------------------------------------------------------------------
 *  Core user document: stored at core-users/{uid}
 *  Contains global membership metadata.
 *  ------------------------------------------------------------------ */
export interface CoreUserDoc extends BaseUserDoc {
  /** App ids where the user participates */
  userOf?: string[]
  /** App ids where the user has elevated permissions */
  adminOf?: string[]
}

/** ------------------------------------------------------------------
 *  App user document: apps/{appId}/users/{uid}
 *  Captures app-specific role overrides.
 *  ------------------------------------------------------------------ */
export interface AppUserDoc extends BaseUserDoc {
  role?: 'user' | 'admin'
}

/** ------------------------------------------------------------------
 *  Unified runtime view consumed by UI and services
 *  Provides flattened convenience fields and raw doc pointers.
 *  ------------------------------------------------------------------ */
export interface User {
  readonly id: string
  display_name?: string
  avatar?: string
  handle?: string
  email?: string
  profiles?: string[]
  role?: AppUserDoc['role']
  userOf?: CoreUserDoc['userOf']
  adminOf?: CoreUserDoc['adminOf']
  core: CoreUserDoc | null
  app: AppUserDoc | null
}

/** ------------------------------------------------------------------
 *  Card-friendly shapes for lists and detail panes
 *  ------------------------------------------------------------------ */
export namespace UserCard {
  export interface Pill {
    id: string
    display_name: string
    avatar?: string
    handle?: string
    role?: 'user' | 'admin'
  }
  export interface Cell extends Pill {
    profiles?: string[]
  }
  export interface Profile extends Cell {
    created_at?: FirebaseTimestamp
    updated_at?: FirebaseTimestamp
  }
}

/** ------------------------------------------------------------------
 *  Helpers: keep data transformations close to the types
 *  ------------------------------------------------------------------ */
export function toUser(
  core: CoreUserDoc | null,
  app: AppUserDoc | null,
  fallbackId = ''
): User {
  const id = core?.id ?? app?.id ?? fallbackId
  return {
    id,
    display_name: app?.display_name ?? core?.display_name,
    avatar: app?.avatar ?? core?.avatar,
    handle: app?.handle ?? core?.handle,
    email: app?.email ?? core?.email,
    profiles: app?.profiles ?? core?.profiles,
    role: app?.role,
    userOf: core?.userOf,
    adminOf: core?.adminOf,
    core: core ?? null,
    app: app ?? null,
  }
}

export function toUserCard(cell: User): UserCard.Cell {
  return {
    id: cell.id,
    display_name: cell.display_name ?? 'Unknown user',
    avatar: cell.avatar,
    handle: cell.handle,
    role: cell.role,
    profiles: cell.profiles,
  }
}

export const isCoreUserDoc = (value: unknown): value is CoreUserDoc => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string') return false
  if (record.created_at === undefined) return false

  const userOf = record['userOf']
  if (userOf !== undefined && !Array.isArray(userOf)) return false

  const adminOf = record['adminOf']
  if (adminOf !== undefined && !Array.isArray(adminOf)) return false

  return true
}

export const isAppUserDoc = (value: unknown): value is AppUserDoc => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string') return false
  if (record.created_at === undefined) return false

  const role = record['role']
  if (role !== undefined && role !== 'user' && role !== 'admin') return false

  return true
}
