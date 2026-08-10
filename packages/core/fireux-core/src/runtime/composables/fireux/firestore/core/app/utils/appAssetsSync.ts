import { useRequireUser } from '../../../../firebase/useRequireUser'
import type { AppAssetSyncResponse } from './appAssets'

export async function syncAppAssetsToStorage(): Promise<AppAssetSyncResponse> {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  const response = await fetch('/api/internal/app/sync-assets', {
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
        ? `App asset sync failed (${response.status}): ${detail}`
        : `App asset sync failed (${response.status}).`
    )
  }

  return (await response.json()) as AppAssetSyncResponse
}
