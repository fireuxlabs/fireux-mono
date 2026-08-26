import { isUserPing, type User } from '../models/user.model.ts'
import { resolveUserAvatarSource } from './user-avatar'

const USER_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const text = (value: unknown) => String(value ?? '').trim()

/**
 * Resolve a stored root document into the one canonical runtime User.
 *
 * A User may legitimately be incomplete while onboarding is unfinished. The
 * normalizer therefore preserves the root with empty presentation fields;
 * directory readers separately require a valid public handle.
 */
export function normalizeUser(idValue: unknown, value: unknown): User | null {
  const id = text(idValue)
  const source = record(value)
  if (!id || !source) return null

  const candidateHandle = text(source.handle).toLowerCase()
  const candidateBio = text(source.bio)
  const candidatePing = text(source.ping)

  return {
    id,
    handle: USER_HANDLE_PATTERN.test(candidateHandle) ? candidateHandle : '',
    display_name: text(source.display_name),
    bio: candidateBio.length <= 280 ? candidateBio : '',
    avatar: resolveUserAvatarSource(source.avatar),
    ping: isUserPing(candidatePing) ? candidatePing : 'Mark',
  }
}

export function isUserDirectoryEligible(user: User): boolean {
  return Boolean(user.handle)
}
