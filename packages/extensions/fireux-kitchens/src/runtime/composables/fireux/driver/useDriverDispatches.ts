// Concurrent edit — 2026-07-20 13:12 CEST — Driver dispatch privacy: consume authenticated beacon and watch endpoints.

import { ref } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  DriverDispatchBeacon,
  DriverDispatchPage,
  DriverDispatchWatchResult,
} from '../../../models/driver/dispatch'

function responseMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return fallback
  }
  const data = payload as Record<string, unknown>
  for (const key of ['statusMessage', 'message', 'statusText']) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return fallback
}

async function bearerToken() {
  const user = await useRequireUser()
  if (user.isAnonymous) throw new Error('A Driver account is required.')
  return user.getIdToken()
}

export function useDriverDispatches() {
  const dispatches = ref<DriverDispatchBeacon[]>([])
  const pending = ref(false)
  const error = ref<Error | null>(null)

  async function load() {
    if (pending.value) return
    pending.value = true
    error.value = null
    try {
      const token = await bearerToken()
      const response = await fetch('/api/internal/driver/dispatches', {
        headers: { authorization: `Bearer ${token}` },
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(
          responseMessage(
            payload,
            `Driver dispatch request failed (${response.status}).`
          )
        )
      }
      dispatches.value = (payload as DriverDispatchPage).items || []
    } catch (loadError) {
      dispatches.value = []
      error.value = loadError instanceof Error
        ? loadError
        : new Error('Driver dispatches could not be loaded.')
    } finally {
      pending.value = false
    }
  }

  async function watchDispatch(dispatch: DriverDispatchBeacon) {
    const token = await bearerToken()
    const response = await fetch('/api/internal/driver/dispatch-watch', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        kitchen_id: dispatch.kitchen.id,
        order_id: dispatch.id,
      }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(
        responseMessage(
          payload,
          `Driver watch request failed (${response.status}).`
        )
      )
    }
    const result = payload as DriverDispatchWatchResult
    const current = dispatches.value.find(
      (item: DriverDispatchBeacon) =>
        item.id === dispatch.id && item.kitchen.id === dispatch.kitchen.id
    )
    if (current && result.changed) {
      current.watching = true
      current.watcher_count += 1
    }
    return result
  }

  return { dispatches, pending, error, load, watchDispatch }
}
