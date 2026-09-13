import { sharedLiveResponse } from './sharedLiveResponse'
import { useAsyncData, createError } from 'nuxt/app'
import type { AsyncDataOptions } from 'nuxt/app'
import {
  getCurrentInstance,
  useId,
  onMounted,
  onScopeDispose,
  toValue,
  watch,
  type Ref,
  type MaybeRefOrGetter,
} from 'vue'

export type LiveFetch = <T>(
  request: string,
  options?: Record<string, any>
) => Promise<T>

/** Keep a server projection live while retaining Nuxt's initial SSR and read states. */
export function useLiveAsyncData<T>(
  key: MaybeRefOrGetter<string>,
  handler: (fetch: LiveFetch) => Promise<T> | T,
  options: Omit<AsyncDataOptions<T>, 'default'> & {
    default?: () => T | Ref<T>
  } = {}
) {
  // Nuxt retains the first handler for a key. Its live connections belong to
  // this component scope, so another page must not inherit a disposed handler.
  // The transport still shares identical reads underneath.
  const ownerId = getCurrentInstance() ? useId() : undefined
  const stateKey = () => (ownerId ? `${toValue(key)}:${ownerId}` : toValue(key))
  const connections = new Map<
    string,
    {
      abort: AbortController
      latest: string
      value: Promise<unknown>
      used: boolean
    }
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
    retryTimer = undefined
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
    stateKey,
    async () => {
      const currentEpoch = ++epoch
      connections.forEach((connection) => {
        connection.used = false
      })
      const liveFetch = (async (request: string, fetchOptions: any = {}) => {
        const fetchSnapshot = () =>
          $fetch(request, {
            ...fetchOptions,
            cache: 'no-store',
          })
        if (!import.meta.client) return fetchSnapshot()
        if (disposed || currentEpoch !== epoch)
          throw new Error('Live reader disposed.')
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
          return fetchSnapshot()
        const headers = new Headers(fetchOptions.headers)
        headers.set('accept', 'text/event-stream')
        const identity = `${toValue(key)}:${url.href}:${JSON.stringify([...headers])}`
        const existing = connections.get(identity)
        if (existing) {
          existing.used = true
          return existing.value
        }
        let resolveInitial!: (value: unknown) => void
        let rejectInitial!: (error: unknown) => void
        const connection = {
          abort: new AbortController(),
          latest: '',
          value: new Promise<unknown>((resolve, reject) => {
            resolveInitial = resolve
            rejectInitial = reject
          }),
          used: true,
        }
        connection.abort.signal.addEventListener(
          'abort',
          () => {
            rejectInitial(new Error('Live reader disposed.'))
          },
          { once: true }
        )
        connections.set(identity, connection)
        void consume()
        async function consume() {
          try {
            const response = await sharedLiveResponse(url, {
              headers,
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
                  const initial = !connection.latest
                  const value = JSON.parse(data)
                  connection.latest = data
                  connection.value = Promise.resolve(value)
                  if (initial) resolveInitial(value)
                  else void invalidate()
                }
              }
            }
          } catch (error) {
            rejectInitial(error)
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
        return connection.value
      }) as LiveFetch
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
  const dispose = () => {
    disposed = true
    closeConnections()
  }
  if (import.meta.client) {
    onScopeDispose(dispose)
    ;(
      import.meta as ImportMeta & {
        hot?: { dispose: (callback: () => void) => void }
      }
    ).hot?.dispose(dispose)
  }
  return state
}
