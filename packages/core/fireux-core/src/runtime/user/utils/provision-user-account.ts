// Concurrent edit — 2026-07-20 12:59 CEST — Account consent slice: send the Firebase bearer token to trusted UserAccount provisioning.

import type { User } from 'firebase/auth'
import {
  FIREUX_ACCOUNT_TERMS_VERSION,
  type UserAccountProvisioningInput,
  type UserAccountProvisioningResult,
} from '../models/user-account-provisioning'

import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { captureCommandScope } from '../../composables/fireux/commands/useCommandScope'

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

export async function provisionSignedInUserAccount(
  user: User,
  termsVersion?: string
): Promise<UserAccountProvisioningResult> {
  if (user.isAnonymous) {
    throw new Error('Anonymous identities cannot provision an account.')
  }
  if (termsVersion && termsVersion !== FIREUX_ACCOUNT_TERMS_VERSION) {
    throw new Error('The account terms version is not current.')
  }

  const { currentUser } = useAuth()
  const scope = captureCommandScope([() => currentUser.value?.uid])
  const assertCurrent = () => {
    if (!scope.isCurrent() || currentUser.value?.uid !== user.uid)
      throw new Error('The account context changed. Please try again.')
  }
  try {
    assertCurrent()
    const token = await user.getIdToken()
    assertCurrent()
    const body: UserAccountProvisioningInput = termsVersion
      ? { terms_version: FIREUX_ACCOUNT_TERMS_VERSION }
      : {}
    const response = await fetch('/api/internal/user/account', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(
        responseMessage(
          payload,
          `Account provisioning failed (${response.status}).`
        )
      )
    }
    if (
      payload?.ok !== true ||
      typeof payload.created !== 'boolean' ||
      typeof payload.terms_recorded !== 'boolean'
    )
      throw new Error('User account provisioning response was invalid.')
    return payload as UserAccountProvisioningResult
  } finally {
    scope.stop()
  }
}
