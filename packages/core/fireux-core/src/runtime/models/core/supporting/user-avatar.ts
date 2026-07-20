// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: fail closed on public avatar sources.
import { readHttpsUrl } from '../../../utils/httpsUrl'

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
  if (!source || isLegacyUserAvatarPlaceholder(source)) {
    return USER_ECOSYSTEM_AVATAR_SRC
  }
  if (source === USER_ECOSYSTEM_AVATAR_SRC) return source
  return readHttpsUrl(source) || USER_ECOSYSTEM_AVATAR_SRC
}
