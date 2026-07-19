export const USER_ECOSYSTEM_AVATAR_SRC = '/img/ecosystem/avatar.png'

const LEGACY_USER_AVATAR_PLACEHOLDERS = new Set([
  '/img/core/defaults/default-thumbnail.png',
  '/img/core/brand/avatar.png',
  '/img/core/brand/logo.png',
])

export function isLegacyUserAvatarPlaceholder(value: unknown): boolean {
  return LEGACY_USER_AVATAR_PLACEHOLDERS.has(String(value ?? '').trim())
}

export function resolveUserAvatarSource(value: unknown): string {
  const source = String(value ?? '').trim()
  return source && !isLegacyUserAvatarPlaceholder(source)
    ? source
    : USER_ECOSYSTEM_AVATAR_SRC
}
