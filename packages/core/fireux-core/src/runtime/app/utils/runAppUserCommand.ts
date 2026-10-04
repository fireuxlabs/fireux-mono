// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: send membership and privilege mutations through the authenticated server boundary.

import type {
  AppMembershipMutationInput,
  AppMembershipMutationResult,
} from '../models/app-membership'
import type { User } from 'firebase/auth'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import { captureCommandScope } from '../../composables/fireux/commands/useCommandScope'
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
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const uid = actor?.uid ?? currentUser.value?.uid
  const appId = config.appId
  const submitted: AppMembershipMutationInput = JSON.parse(
    JSON.stringify(input)
  )
  const body = JSON.stringify(submitted)
  const scope = captureCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
  ])
  const assertCurrent = () => {
    if (!uid || currentUser.value?.uid !== uid || !scope.isCurrent()) {
      throw new Error('The App or account context changed. Please try again.')
    }
  }
  try {
    const user = actor ?? (await useRequireUser())
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account context changed. Please try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const response = await fetch('/api/internal/app/membership', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body,
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
    const expectedUserId =
      'userId' in submitted && submitted.userId ? submitted.userId : uid
    if (
      payload?.ok !== true ||
      payload.action !== submitted.action ||
      payload.appId !== appId ||
      payload.userId !== expectedUserId
    ) {
      throw new Error(
        'App membership response did not match the requested action.'
      )
    }
    return payload as AppMembershipMutationResult
  } finally {
    scope.stop()
  }
}
