// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: bind browser-created profiles to the authenticated User id.
// Concurrent edit — 2026-07-20 13:19 CEST — Profile overlay follow-up: keep overlays delta-only and mirror every app-backed profile to AppUser.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: create and repair domain-only root profile documents.
// Concurrent edit — 2026-07-20 18:05 CEST — Repo Efficiency Pass 2 of 6: expose self-provisioning without a caller-supplied User target.
import type { ProfileConfig } from '../../../../../../models/utils/profile.model'
import type { ProfileProvisionResult } from '../../../../../../models/operations/profile-provisioning'
import { requireUid } from '../../../utils/useEnsureCommon'

function responseMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return fallback
  }

  const record = payload as Record<string, unknown>
  for (const key of ['statusMessage', 'message', 'statusText']) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return fallback
}

/**
 * Requests idempotent profile provisioning from the fixed domain endpoint.
 * The browser supplies no collection, seed, App id, timestamps, or target uid.
 */
export function useProfileCreate(config: ProfileConfig) {
  const createProfile = async (): Promise<ProfileProvisionResult> => {
    const { uid, auth } = await requireUid()
    const token = await auth.getIdToken()
    const response = await fetch(config.provisionRoute, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        responseMessage(
          payload,
          `${config.profileType} provisioning failed (${response.status}).`
        )
      )
    }

    const result = payload as Partial<ProfileProvisionResult> | null
    if (
      result?.ok !== true ||
      result.userId !== uid ||
      result.profileKind !== config.kind ||
      typeof result.createdProfile !== 'boolean' ||
      typeof result.createdAppState !== 'boolean'
    ) {
      throw new Error(
        `[useProfileCreate] ${config.profileType} provision response was invalid.`
      )
    }

    return result as ProfileProvisionResult
  }

  return { createProfile }
}
