import { useRequireUser } from '../../../../composables/fireux/firebase/useRequireUser'
import type { AppMediaSyncResponse } from './appMedia'

export async function syncAppMediaToStorage(): Promise<AppMediaSyncResponse> {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  const response = await fetch('/api/internal/app/sync-media', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const errorPayload = await response
      .json()
      .catch(() => null) as { message?: unknown; statusMessage?: unknown } | null
    const detail = String(
      errorPayload?.statusMessage || errorPayload?.message || ''
    ).trim()
    throw new Error(
      detail
        ? `App media sync failed (${response.status}): ${detail}`
        : `App media sync failed (${response.status}).`
    )
  }

  return (await response.json()) as AppMediaSyncResponse
}
