import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { normalizeString } from '../../../../../../utils/string'
import type { AppMediaSyncResponse } from './appMedia'

export async function syncAppMediaToStorage(
  appId?: string
): Promise<AppMediaSyncResponse> {
  const fireux = useFireUXConfig()
  const targetAppId = normalizeString(appId || fireux.appId)
  if (!targetAppId) {
    throw new Error('[useAppCreate] Missing appId for media sync')
  }

  const response = await fetch('/api/internal/app/sync-media', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ appId: targetAppId }),
  })

  if (!response.ok) {
    throw new Error(`[useAppCreate] Media sync failed (${response.status})`)
  }

  return await response.json() as AppMediaSyncResponse
}
