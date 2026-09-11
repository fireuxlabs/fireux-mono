import { useAsyncData, createError } from 'nuxt/app'
import type { AsyncDataOptions } from 'nuxt/app'
import {
  getCurrentInstance,
  onMounted,
  onScopeDispose,
  toValue,
  watch,
  type Ref,
  type MaybeRefOrGetter,
} from 'vue'

type Fetcher = typeof $fetch

/** Keep a server projection live while retaining Nuxt's initial SSR and read states. */
export function useLiveAsyncData<T>(
  key: MaybeRefOrGetter<string>,
  handler: (fetch: Fetcher) => Promise<T> | T,
  options: Omit<AsyncDataOptions<T>, 'default'> & {
    default?: () => T | Ref<T>
  } = {}
) {
  const connections = new Map<
    string,
    { abort: AbortController; latest: string; used: boolean }
  >()
  let disposed = false
  let refreshing = false
  let dirty = false
  let epoch = 0
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let retryDelay = 1000
  const closeConnections = () => {
    epoch++
    if (retryTimer) clearTimeout(retryTimer)
    connections.forEach((connection) => connection.abort.abort())
    connections.clear()
  }
  const retryConnection = (error: unknown) => {
    const status = Number((error as { statusCode?: number })?.statusCode)
    if (disposed || [400, 401, 403, 404, 501].includes(status) || retryTimer)
      return
    retryTimer = setTimeout(() => {
      retryTimer = undefined
      void invalidate()
    }, retryDelay)
    retryDelay = Math.min(retryDelay * 2, 30000)
  }
  const invalidate = async () => {
    if (disposed) return
    dirty = true
    if (refreshing) return
    refreshing = true
    try {
      while (dirty && !disposed) {
        dirty = false
        await state.refresh({ cachedData: undefined })
      }
    } finally {
      refreshing = false
    }
  }
  const state = useAsyncData<T>(
    key,
    async () => {
      const currentEpoch = ++epoch
      connections.forEach((connection) => {
        connection.used = false
      })
      const liveFetch = (async (request: string, fetchOptions: any = {}) => {
        const result = await $fetch(request, {
          ...fetchOptions,
          cache: 'no-store',
        })
        if (!import.meta.client || disposed || currentEpoch !== epoch)
          return result
        const url = new URL(request, window.location.origin)
        for (const [name, value] of Object.entries(
          fetchOptions.query || fetchOptions.params || {}
        )) {
          if (value != null) url.searchParams.set(name, String(value))
        }
        if (
          url.origin !== window.location.origin ||
          (fetchOptions.method && fetchOptions.method !== 'GET')
        )
          return result
        const headers = new Headers(fetchOptions.headers)
        headers.set('accept', 'text/event-stream')
        const identity = `${toValue(key)}:${url.href}:${JSON.stringify([...headers])}`
        const existing = connections.get(identity)
        const serialized = JSON.stringify(result)
        if (existing) {
          existing.used = true
          existing.latest = serialized
          return result
        }
        const connection = {
          abort: new AbortController(),
          latest: serialized,
          used: true,
        }
        connections.set(identity, connection)
        void consume()
        async function consume() {
          try {
            const response = await fetch(url, {
              headers,
              credentials: 'same-origin',
              signal: connection.abort.signal,
            })
            if (!response.ok)
              throw createError({
                statusCode: response.status,
                message: 'Live data is unavailable.',
              })
            if (
              !response.headers
                .get('content-type')
                ?.includes('text/event-stream')
            ) {
              throw createError({
                statusCode: 501,
                message: 'This data endpoint does not support live reads.',
              })
            }
            retryDelay = 1000
            const reader = response.body!.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            while (!connection.abort.signal.aborted) {
              const chunk = await reader.read()
              if (chunk.done) throw new Error('Live data connection closed.')
              buffer += decoder
                .decode(chunk.value, { stream: true })
                .replaceAll('\r\n', '\n')
              let boundary: number
              while ((boundary = buffer.indexOf('\n\n')) >= 0) {
                const message = buffer.slice(0, boundary)
                buffer = buffer.slice(boundary + 2)
                const data = message
                  .split('\n')
                  .filter((line) => line.startsWith('data:'))
                  .map((line) => line.slice(5).trimStart())
                  .join('\n')
                if (!data) continue
                if (message.includes('event: read-error')) {
                  const failure = JSON.parse(data)
                  throw createError({
                    statusCode: failure.statusCode,
                    message: failure.message,
                  })
                }
                if (data !== connection.latest) {
                  connection.latest = data
                  void invalidate()
                }
              }
            }
          } catch (error) {
            if (
              !connection.abort.signal.aborted &&
              !disposed &&
              connections.get(identity) === connection
            ) {
              // Never leave revoked or unavailable records presented as current live data.
              state.data.value = undefined as any
              state.error.value = createError(error as Error) as any
              state.status.value = 'error'
              connection.abort.abort()
              connections.delete(identity)
              retryConnection(error)
            }
          }
        }
        return result
      }) as Fetcher
      try {
        return await handler(liveFetch)
      } catch (error) {
        if (import.meta.client) retryConnection(error)
        throw error
      } finally {
        if (currentEpoch === epoch)
          for (const [identity, connection] of connections) {
            if (!connection.used) {
              connection.abort.abort()
              connections.delete(identity)
            }
          }
      }
    },
    options as AsyncDataOptions<T>
  )
  if (import.meta.client)
    watch(
      [
        () => toValue(key),
        ...(Array.isArray(options.watch) ? options.watch : []),
      ],
      closeConnections,
      { flush: 'sync' }
    )
  if (import.meta.client && getCurrentInstance())
    onMounted(() => {
      void state.then(() => {
        if (!disposed && options.immediate !== false && !connections.size)
          void state.execute({ cachedData: undefined })
      })
    })
  if (import.meta.client)
    onScopeDispose(() => {
      disposed = true
      closeConnections()
    })
  return state
}
