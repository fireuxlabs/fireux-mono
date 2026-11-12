import type { FireuxStamped } from '../../models/utils/stamps.model.ts'

/** Private ecosystem-scoped AI memory for one authenticated User. */
export interface UserContext extends FireuxStamped {
  id: string
  context: string
}

export const USER_CONTEXT_MAX_LENGTH = 8000

export const UserContextStorage = {
  shape: 'scoped',
  path: 'users/{userId}/private/context',
  collection: 'private',
  document: 'context',
  parent: 'user',
  idParam: 'userId',
} as const

export type CurrentUserContextResponse = {
  ok: true
  context: string
  userContext: UserContext | null
}

export type UpdateCurrentUserContextResponse = {
  ok: true
  context: string
}
