// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: route membership creation, bootstrap, and removal through the trusted server boundary.
// Concurrent edit — 2026-07-20 13:10 CEST — User handle security pass: provision canonical User identity through the trusted reservation boundary.
// Concurrent edit — 2026-07-20 17:49 CEST — Repo Efficiency Pass 2 of 6: remove browser notification construction from the canonical create helpers.

import { updateUserHandle } from './update-user-handle'
import { USER_ECOSYSTEM_AVATAR_FALLBACK_SOURCE } from './user-avatar'
import { provisionSignedInUserAvatar } from './provision-user-avatar'

import type {
  UserProvisioningOptions,
  UserProvisioningResult,
} from '../models/user-provisioning'

function normalizePublicDisplayNameSeed(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^[^\s@]+@[^\s@]+$/.test(trimmed)
    ? trimmed.split('@')[0]?.trim() || ''
    : trimmed
}

export async function provisionUserIdentity(
  uid: string,
  options: UserProvisioningOptions = {},
  isOwnerCurrent: () => boolean = () => true
): Promise<UserProvisioningResult> {
  const displayName = normalizePublicDisplayNameSeed(options.displayName ?? '')
  if (!displayName) {
    throw new Error('[provisionUserIdentity] Missing displayName')
  }
  const handle = makeHandle(displayName, uid)
  const result = await updateUserHandle(
    uid,
    handle,
    {
      display_name: displayName,
      avatar: USER_ECOSYSTEM_AVATAR_FALLBACK_SOURCE,
    },
    isOwnerCurrent
  )
  // Establish identity and its terms/handle checks before uploading any file.
  // Repeated bootstrap must not replace an existing User's selected avatar.
  if (result.created && options.avatar) {
    await provisionSignedInUserAvatar(uid, options.avatar, isOwnerCurrent)
  }

  return { created: result.created, displayName, handle: result.handle }
}

function makeHandle(displayName: string, uid: string) {
  // Strict rule: NEVER invent a word fallback.
  // Deterministic handle: cleaned displayName prefix (may be empty) + uid suffix.
  const cleaned = displayName.toLowerCase().replaceAll(/[^a-z0-9]/g, '')
  const suffix = uid.slice(0, 8)
  const combined = `${cleaned}${suffix}`.slice(0, 12)
  if (!combined) throw new Error('[makeHandle] Unable to derive handle')
  return combined
}
