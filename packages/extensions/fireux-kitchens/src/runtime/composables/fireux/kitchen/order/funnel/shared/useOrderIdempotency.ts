import {
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'

type StoredOrderSubmission = {
  fingerprint: string
  key: string
}

const text = (value: unknown) => String(value ?? '').trim()
const canonicalValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, canonicalValue(child)])
  )
}
const fallbackDigest = (value: string) => {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}
const requestFingerprint = async (request: unknown) => {
  const value = JSON.stringify(canonicalValue(request))
  if (!globalThis.crypto?.subtle) return fallbackDigest(value)

  const bytes = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
const createKey = () => {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) return uuid

  return [
    'menu',
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
    Math.random().toString(36).slice(2),
  ].join('-')
}
const readStored = (storageKey: string): StoredOrderSubmission | null => {
  if (!import.meta.client || !storageKey) return null

  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) || 'null')
    const fingerprint = text(value?.fingerprint)
    const key = text(value?.key)

    return fingerprint && key ? { fingerprint, key } : null
  } catch {
    return null
  }
}

export function useOrderIdempotency(
  scope: MaybeRefOrGetter<string | null | undefined>
) {
  const current = ref<(StoredOrderSubmission & { storageKey: string }) | null>(null)
  const storageKey = () => {
    const value = text(toValue(scope))

    return value ? `fireux:menu-order:${value}:submission` : ''
  }

  async function keyFor(request: unknown) {
    const nextStorageKey = storageKey()
    const fingerprint = await requestFingerprint(request)
    if (
      current.value?.storageKey === nextStorageKey &&
      current.value.fingerprint === fingerprint
    ) {
      return current.value.key
    }

    const stored = readStored(nextStorageKey)
    const key = stored?.fingerprint === fingerprint ? stored.key : createKey()
    current.value = {
      storageKey: nextStorageKey,
      fingerprint,
      key,
    }

    if (import.meta.client && nextStorageKey) {
      try {
        window.localStorage.setItem(
          nextStorageKey,
          JSON.stringify({ fingerprint, key })
        )
      } catch {
        // The in-memory key still protects retries in this mounted session.
      }
    }

    return key
  }

  function complete() {
    const nextStorageKey = current.value?.storageKey || storageKey()
    current.value = null
    if (import.meta.client && nextStorageKey) {
      try {
        window.localStorage.removeItem(nextStorageKey)
      } catch {
        // Storage may be disabled; the in-memory submission is already cleared.
      }
    }
  }

  return {
    complete,
    keyFor,
  }
}
