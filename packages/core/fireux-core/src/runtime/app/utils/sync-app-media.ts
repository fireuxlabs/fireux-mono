import { refreshNuxtData } from 'nuxt/app'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { captureCommandScope } from '../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import { useRequireUser } from '../../composables/fireux/firebase/useRequireUser'
import type { AppImageKind, AppMediaSyncResponse } from '../models/app-media'

export async function syncAppMediaToStorage(
  kinds?: readonly AppImageKind[]
): Promise<AppMediaSyncResponse> {
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
  const body = JSON.stringify(kinds ? { kinds: [...kinds] } : {})
  try {
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account context changed. Please try again.')
    const token = await user.getIdToken()
    assertCurrent()
    const response = await fetch('/api/internal/app/sync-media', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body,
    })

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as {
        message?: unknown
        statusMessage?: unknown
      } | null
      const detail = String(
        errorPayload?.statusMessage || errorPayload?.message || ''
      ).trim()
      throw new Error(
        detail
          ? `App media sync failed (${response.status}): ${detail}`
          : `App media sync failed (${response.status}).`
      )
    }

    const payload = await response.json()
    if (
      payload?.appId !== appId ||
      !payload.uploaded ||
      !Array.isArray(payload.failed)
    )
      throw new Error('App media response did not match the requested App.')
    if (scope.isCurrent())
      await refreshNuxtData(JSON.stringify(['app-read', appId, uid]))
    return payload as AppMediaSyncResponse
  } finally {
    scope.stop()
  }
}
