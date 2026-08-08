import type { AppInitializationResult } from '../../../../models/operations/app-initialization'
import { useRequireUser } from '../../firebase/useRequireUser'

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
  const user = await useRequireUser()
  const token = await user.getIdToken()
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

  return payload as AppInitializationResult
}
