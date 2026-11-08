// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: fail closed on public avatar sources.
import { readHttpsUrl } from '../../utils/https-url'

export const USER_ECOSYSTEM_AVATAR_SRC = '/img/ecosystem/avatar.png'

export function resolveUserAvatarSource(value: unknown): string {
  const source = String(value ?? '').trim()
  if (source === USER_ECOSYSTEM_AVATAR_SRC) return source
  return readHttpsUrl(source) || USER_ECOSYSTEM_AVATAR_SRC
}
