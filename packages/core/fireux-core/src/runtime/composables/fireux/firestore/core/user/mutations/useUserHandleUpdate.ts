// User handle writes use the trusted User endpoint instead of client writes.

import { refreshNuxtData } from '#imports'
import type {
  UserHandleInput,
  UserHandleResult,
} from '../../../../../../models/operations/user-handle'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import { validateUserHandleForPublicRoute } from '../utils/identity/useUserHandleIdentity'
import { publicUserIdentityAsyncDataKey } from '../../../../public/user/usePublicUserIdentity'

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

export function useUserHandleUpdate() {
  const updateHandle = async (
    uid: string,
    desiredHandle: string,
    create?: UserHandleInput['create']
  ): Promise<UserHandleResult> => {
    const normalizedUid = String(uid || '').trim()
    if (!normalizedUid) throw new Error('Missing uid')

    const validation = validateUserHandleForPublicRoute(desiredHandle)
    if (!validation.isValid) throw new Error(validation.message || 'Invalid handle')

    const user = await useRequireUser()
    if (user.uid !== normalizedUid) {
      throw new Error('A handle can only be claimed for the signed-in user.')
    }

    const token = await user.getIdToken()
    const body: UserHandleInput = {
      handle: validation.handle,
      ...(create ? { create } : {}),
    }
    const response = await fetch('/api/internal/user/handle', {
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
        responseMessage(payload, `Handle update failed (${response.status}).`)
      )
    }

    await refreshNuxtData(publicUserIdentityAsyncDataKey(normalizedUid))

    return payload as UserHandleResult
  }

  return { updateHandle }
}
