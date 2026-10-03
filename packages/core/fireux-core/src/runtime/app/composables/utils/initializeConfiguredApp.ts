import type { AppInitializationResult } from '../../models/app-initialization'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { captureCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../config/FireUXConfig'
import { useRequireUser } from '../../../composables/fireux/firebase/useRequireUser'

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

export async function initializeConfiguredApp(): Promise<AppInitializationResult> {
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const uid = currentUser.value?.uid
  const appId = config.appId
  const scope = captureCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
  ])
  const assertCurrent = () => {
    if (!uid || !scope.isCurrent() || currentUser.value?.uid !== uid)
      throw new Error('The App or account context changed. Please try again.')
  }
  try {
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account context changed. Please try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const response = await fetch('/api/internal/app/initialize', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })
    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        responseMessage(
          payload,
          `App initialization failed (${response.status}).`
        )
      )
    }

    if (
      payload?.ok !== true ||
      payload.appId !== appId ||
      payload.userId !== uid
    )
      throw new Error(
        'App initialization response did not match the requested App.'
      )
    return payload as AppInitializationResult
  } finally {
    scope.stop()
  }
}
