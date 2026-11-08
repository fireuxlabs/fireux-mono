import type { User } from '../models/user.model'
import { resolveUserAvatarSource } from './user-avatar'
import { readUserDisplayName } from './profile-validation'

const USER_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/**
 * Resolve a stored root document into the one canonical runtime User.
 *
 * A User may legitimately be incomplete while onboarding is unfinished. The
 * normalizer therefore preserves the root with empty presentation fields;
 * directory readers separately require a valid public handle.
 */
export function normalizeUser(idValue: unknown, value: unknown): User | null {
  const id = String(idValue ?? '').trim()
  const source = record(value)
  if (!id || !source) return null

  const candidateHandle = text(source.handle).toLowerCase()
  const candidateBio = text(source.bio)

  return {
    id,
    handle: USER_HANDLE_PATTERN.test(candidateHandle) ? candidateHandle : '',
    display_name: text(source.display_name),
    bio: candidateBio.length <= 280 ? candidateBio : '',
    avatar: resolveUserAvatarSource(source.avatar),
  }
}

export function isUserDirectoryEligible(user: User): boolean {
  return Boolean(user.handle)
}

/** Minimum identity needed to finish setup; incomplete Users remain readable. */
export function isUserIdentityComplete(user: User | null | undefined): boolean {
  if (!user || !USER_HANDLE_PATTERN.test(user.handle)) return false
  try {
    readUserDisplayName(user.display_name)
    return true
  } catch {
    return false
  }
}
