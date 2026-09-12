import type { User } from '../models/user.model'

export const USER_DISPLAY_NAME_MAX_LENGTH = 120

export type UserProfileChanges = Partial<Pick<User, 'display_name' | 'bio'>>

export function readUserDisplayName(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Display name must be text.')
  const name = value.trim()
  if (!name || name.length > USER_DISPLAY_NAME_MAX_LENGTH) {
    throw new Error(
      `Display name must be between 1 and ${USER_DISPLAY_NAME_MAX_LENGTH} characters.`
    )
  }
  return name
}

/** Validate the same editable User fields for single-field and grouped saves. */
export function readUserProfileChanges(value: unknown): UserProfileChanges {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('A profile change is required.')
  }
  const entries = Object.entries(value)
  if (!entries.length) throw new Error('A profile change is required.')
  const changes: UserProfileChanges = {}
  for (const [key, raw] of entries) {
    if (!['display_name', 'bio'].includes(key)) {
      throw new Error(`Profile field is not editable: ${key}`)
    }
    if (typeof raw !== 'string') throw new Error(`${key} must be text.`)
    const text = raw.replaceAll('\r\n', '\n').trim()
    if (key === 'display_name') changes.display_name = readUserDisplayName(text)
    if (key === 'bio') {
      if (text.length > 280)
        throw new Error('Bio must be 280 characters or less.')
      changes.bio = text
    }
  }
  return changes
}
