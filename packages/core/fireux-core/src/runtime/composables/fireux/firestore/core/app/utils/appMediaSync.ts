import { useRequireUser } from '../../../../firebase/useRequireUser'
import type { AppMediaSyncResponse } from './appMedia'

export async function syncAppMediaToStorage(): Promise<AppMediaSyncResponse> {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  const response = await fetch('/api/internal/app/sync-media', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`App media sync failed (${response.status}).`)
  }

  return (await response.json()) as AppMediaSyncResponse
}
