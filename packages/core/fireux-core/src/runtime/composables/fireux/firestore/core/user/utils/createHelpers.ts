// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: route membership creation, bootstrap, and removal through the trusted server boundary.
// Concurrent edit — 2026-07-20 13:10 CEST — User handle security pass: provision canonical User identity through the trusted reservation boundary.
// Concurrent edit — 2026-07-20 17:49 CEST — Repo Efficiency Pass 2 of 6: remove browser notification construction from the canonical create helpers.

import { useRequireUser } from '../../../../firebase/useRequireUser'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useUserHandleClaim } from '../mutations/useUserHandleClaim'
import { mutateAppMembership } from './appMembershipMutation'

export type CreateCoreOptions = {
  displayName?: string
  avatar?: string | null
  ecosystemName?: string
}

export type CreateCoreResult = {
  created: boolean
  displayName: string
  handle: string
}

function normalizePublicDisplayNameSeed(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^[^\s@]+@[^\s@]+$/.test(trimmed)
    ? trimmed.split('@')[0]?.trim() || ''
    : trimmed
}

export async function createCoreUserDocument(
  uid: string,
  options: CreateCoreOptions = {}
): Promise<CreateCoreResult> {
  const displayName = normalizePublicDisplayNameSeed(options.displayName ?? '')
  if (!displayName) {
    throw new Error('[createCoreUserDocument] Missing displayName')
  }
  const handle = makeHandle(displayName, uid)
  const { claimHandle } = useUserHandleClaim()
  const result = await claimHandle(uid, handle, {
    display_name: displayName,
    avatar: options.avatar,
  })

  return { created: result.created, displayName, handle: result.handle }
}

export type CreateMembershipResult = { created: boolean }

async function requireCurrentMembershipContext(appId: string, uid: string) {
  const actor = await useRequireUser()
  const currentAppId = String(useFireUXConfig().appId || '').trim()
  const targetAppId = String(appId || '').trim()
  const targetUid = String(uid || '').trim()

  if (!targetAppId || targetAppId !== currentAppId) {
    throw new Error('[App membership] The target App is not the active runtime App.')
  }
  if (!targetUid || actor.uid !== targetUid) {
    throw new Error('[App membership] Self-service membership must target the signed-in user.')
  }
}

export async function createAppUserMembership(
  appId: string,
  uid: string,
  membershipRole: 'admin' | 'user'
): Promise<CreateMembershipResult> {
  await requireCurrentMembershipContext(appId, uid)
  if (membershipRole !== 'user') {
    throw new Error(
      '[createAppUserMembership] Admin membership requires the trusted bootstrap or App-admin action.'
    )
  }
  const result = await mutateAppMembership({ action: 'ensure-self' })
  return { created: result.created === true }
}

export async function bootstrapAppUserAdmin(
  appId: string,
  uid: string
): Promise<CreateMembershipResult> {
  await requireCurrentMembershipContext(appId, uid)
  const result = await mutateAppMembership({ action: 'bootstrap-admin' })
  return { created: result.created === true }
}

export type RemoveMembershipResult = { removed: boolean }

export async function removeAppUserMembership(
  appId: string,
  uid: string
): Promise<RemoveMembershipResult> {
  await requireCurrentMembershipContext(appId, uid)
  const result = await mutateAppMembership({
    action: 'remove-member',
    userId: uid,
  })
  return { removed: result.removed === true }
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
