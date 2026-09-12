// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: send membership and privilege mutations through the authenticated server boundary.

import type {
  AppMembershipMutationInput,
  AppMembershipMutationResult,
} from '../models/app-membership'
import type { User } from 'firebase/auth'
import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'

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

export async function runAppUserCommand(
  input: AppMembershipMutationInput,
  actor?: User
): Promise<AppMembershipMutationResult> {
  const user = actor ?? (await useRequireUser())
  const token = await user.getIdToken()
  const response = await fetch('/api/internal/app/membership', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      responseMessage(
        payload,
        `App membership request failed (${response.status}).`
      )
    )
  }

  // The AppUser Firestore listener observes the committed document. Do not
  // patch Nuxt state or force a refresh here.
  return payload as AppMembershipMutationResult
}
