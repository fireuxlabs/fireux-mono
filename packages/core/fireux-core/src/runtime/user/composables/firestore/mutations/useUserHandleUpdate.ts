import type {
  UserHandleInput,
  UserHandleResult,
} from '../../../models/user-handle'
import { useRequireUser } from '../../../../composables/fireux/firebase/useRequireUser'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { captureCommandScope } from '../../../../composables/fireux/commands/useCommandScope'
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

    const body: UserHandleInput = {
      handle: validation.handle,
      ...(create ? { create: { ...create } } : {}),
    }
    const { currentUser } = useAuth()
    const scope = captureCommandScope([() => currentUser.value?.uid])
    const assertCurrent = () => {
      if (!scope.isCurrent() || currentUser.value?.uid !== userId)
        throw new Error('The account context changed. Please try again.')
    }
    try {
      const signedInUser = await useRequireUser()
      assertCurrent()
      if (signedInUser.uid !== userId) {
        throw new Error('You can only update your own handle.')
      }

      const token = await signedInUser.getIdToken()
      assertCurrent()
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

      if (
        payload?.uid !== userId ||
        payload.handle !== validation.handle ||
        typeof payload.created !== 'boolean' ||
        typeof payload.changed !== 'boolean'
      ) {
        throw new Error(
          'User handle response did not match the requested User.'
        )
      }
      return payload as UserHandleResult
    } finally {
      scope.stop()
    }
  }

  return { updateHandle }
}
