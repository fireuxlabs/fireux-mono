// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: send membership and privilege mutations through the authenticated server boundary.

import { refreshNuxtData } from '#imports'
import type {
  AppMembershipMutationInput,
  AppMembershipMutationResult,
} from '../../../../app/models/app-membership'
import { CURRENT_APP_CONTEXT_ASYNC_DATA_KEY } from '../../../../app/composables/currentAppContext'
import { useRequireUser } from '../../../../composables/fireux/firebase/useRequireUser'

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

export async function mutateAppMembership(
  input: AppMembershipMutationInput
): Promise<AppMembershipMutationResult> {
  const user = await useRequireUser()
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

  const result = payload as AppMembershipMutationResult
  void refreshNuxtData(CURRENT_APP_CONTEXT_ASYNC_DATA_KEY)
  return result
}
