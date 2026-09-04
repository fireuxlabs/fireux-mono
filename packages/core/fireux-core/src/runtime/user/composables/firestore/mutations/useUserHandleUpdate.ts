import type {
  UserHandleInput,
  UserHandleResult,
} from '../../../models/user-handle'
import { useRequireUser } from '../../../../composables/fireux/firebase/useRequireUser'
import { validateUserHandleForPublicRoute } from '../utils/identity/useUserHandleIdentity'

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
    handle: string,
    create?: UserHandleInput['create']
  ): Promise<UserHandleResult> => {
    const userId = String(uid || '').trim()
    if (!userId) throw new Error('User is not ready.')

    const validation = validateUserHandleForPublicRoute(handle)
    if (!validation.isValid)
      throw new Error(validation.message || 'Invalid handle')

    const signedInUser = await useRequireUser()
    if (signedInUser.uid !== userId) {
      throw new Error('You can only update your own handle.')
    }

    const token = await signedInUser.getIdToken()
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

    return payload as UserHandleResult
  }

  return { updateHandle }
}
