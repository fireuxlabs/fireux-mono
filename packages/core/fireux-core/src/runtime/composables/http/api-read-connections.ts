import { createParser } from 'eventsource-parser'
import {
  API_READ_ENDPOINT,
  API_READ_MAX_CHANNELS,
  API_READ_MAX_BODY_BYTES,
  parseApiReadEvent,
  type ApiReadAccess,
  type ApiReadEvent,
  type ApiReadSubscription,
} from '../../utils/api-read-protocol'

export type ApiReadFailure = Extract<ApiReadEvent, { type: 'error' }>
type Listener = {
  version: string
  notified: string
  change: (version: string) => void
  error: (failure: ApiReadFailure) => void
}
type Channel = ApiReadSubscription & {
  access: ApiReadAccess
  failed: boolean
  disabled: boolean
  authRetried: boolean
  serverVersion?: string
  listeners: Set<Listener>
}

/** A single fetch stream serves every active API read in one Nuxt App identity scope. */
export function createApiReadConnections(options: {
  fetch?: typeof globalThis.fetch
  token: (forceRefresh: boolean) => Promise<string | undefined>
  endpoint?: string
  retryDelay?: (attempt: number) => number
  heartbeatTimeoutMs?: number
}) {
  const fetchStream = options.fetch ?? globalThis.fetch.bind(globalThis)
  const channels = new Map<string, Channel>()
  let serial = 0,
    generation = 0,
    attempt = 0,
    identity = ''
  let controller: AbortController | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let healthTimer: ReturnType<typeof setTimeout> | undefined
  let forceToken = false,
    authRetried = false

  function abort() {
    generation++
    controller?.abort()
    controller = undefined
    clearTimeout(timer)
    clearTimeout(healthTimer)
    timer = undefined
  }
  function schedule(delay = 0) {
    clearTimeout(timer)
    timer = undefined
    if (!channels.size) {
      abort()
      return
    }
    timer = setTimeout(() => {
      timer = undefined
      void connect()
    }, delay)
  }
  function retry() {
    const count = attempt++
    const delay =
      options.retryDelay?.(count) ??
      Math.min(
        30_000,
        1000 * 2 ** Math.min(count, 5) * (0.8 + Math.random() * 0.4)
      )
    schedule(delay)
  }
  function fail(channel: Channel, failure: ApiReadFailure) {
    channel.failed = true
    for (const listener of [...channel.listeners]) listener.error(failure)
  }
  function message(value: ApiReadEvent, current: number) {
    if (current !== generation) return
    if (value.type === 'ping') return
    if (value.type === 'reauth') {
      schedule()
      return
    }
    const channel = [...channels.values()].find(
      (candidate) => candidate.id === value.id
    )
    if (!channel) return
    if (value.type === 'error') {
      fail(channel, value)
      if (value.statusCode === 401 && !channel.authRetried) {
        channel.authRetried = true
        forceToken = true
        schedule()
      } else if (value.statusCode === 401) {
        channel.disabled = true
        schedule()
      } else if (value.retryable) retry()
      return
    }
    const recovered = channel.failed
    channel.failed = false
    channel.disabled = false
    channel.authRetried = false
    channel.serverVersion = value.version
    attempt = 0
    if (channel.access === 'protected') authRetried = false
    for (const listener of [...channel.listeners]) {
      if (listener.version === value.version && !recovered) continue
      if (listener.notified === value.version && !recovered) continue
      listener.notified = value.version
      listener.change(value.version)
    }
  }
  async function connect() {
    abort()
    if (!channels.size) return
    const current = generation
    const request = [...channels.values()].filter(
      (channel) => !channel.disabled
    )
    if (!request.length) return
    const active = new AbortController()
    controller = active
    const armHealth = () => {
      clearTimeout(healthTimer)
      healthTimer = setTimeout(() => {
        if (current !== generation) return
        for (const channel of request)
          fail(channel, {
            type: 'error',
            id: channel.id,
            statusCode: 503,
            message: 'Live data is temporarily unavailable.',
            retryable: true,
          })
        active.abort()
        retry()
      }, options.heartbeatTimeoutMs ?? 45_000)
    }
    try {
      const protectedRead = request.some(
        (channel) => channel.access === 'protected'
      )
      const force = forceToken
      forceToken = false
      let token: string | undefined
      try {
        token = protectedRead ? await options.token(force) : undefined
      } catch {
        if (current !== generation) return
        for (const channel of request.filter(
          (item) => item.access === 'protected'
        )) {
          channel.disabled = true
          fail(channel, {
            type: 'error',
            id: channel.id,
            statusCode: 401,
            message: 'Sign in to continue this live read.',
            retryable: false,
          })
        }
        schedule()
        return
      }
      if (current !== generation || active.signal.aborted) return
      armHealth()
      const response = await fetchStream(
        options.endpoint ?? API_READ_ENDPOINT,
        {
          method: 'POST',
          credentials: 'same-origin',
          cache: 'no-store',
          signal: active.signal,
          headers: {
            accept: 'text/event-stream',
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(
            request.map(({ id, url, version, language }) => ({
              id,
              url,
              version,
              ...(language ? { language } : {}),
            }))
          ),
        }
      )
      if (
        !response.ok ||
        !response.body ||
        !response.headers.get('content-type')?.includes('text/event-stream')
      ) {
        if (response.status === 401 && !authRetried) {
          authRetried = true
          forceToken = true
          schedule()
          return
        }
        if (response.status === 401) {
          for (const channel of request.filter(
            (item) => item.access === 'protected'
          )) {
            channel.disabled = true
            fail(channel, {
              type: 'error',
              id: channel.id,
              statusCode: 401,
              message: 'Sign in to continue this live read.',
              retryable: false,
            })
          }
          schedule()
          return
        }
        throw new Error('The live read connection is unavailable.')
      }
      const parser = createParser({
        onEvent: (event) => {
          if (event.data.length > 4096)
            throw new Error('Live read message is too large.')
          message(parseApiReadEvent(JSON.parse(event.data)), current)
        },
        onError: () => {
          throw new Error('Invalid live read stream.')
        },
      })
      const reader = response.body.getReader(),
        decoder = new TextDecoder()
      try {
        for (;;) {
          const chunk = await reader.read()
          if (current !== generation || active.signal.aborted) return
          if (chunk.done) break
          armHealth()
          parser.feed(decoder.decode(chunk.value, { stream: true }))
        }
        parser.feed(decoder.decode())
      } finally {
        reader.releaseLock()
      }
      if (current === generation && !timer) retry()
    } catch {
      if (current !== generation || active.signal.aborted) return
      for (const channel of channels.values())
        fail(channel, {
          type: 'error',
          id: channel.id,
          statusCode: 503,
          message: 'Live data is temporarily unavailable.',
          retryable: true,
        })
      if (!timer) retry()
    } finally {
      if (current === generation) {
        clearTimeout(healthTimer)
        healthTimer = undefined
      }
    }
  }

  return {
    get size() {
      return channels.size
    },
    setIdentity(next: string) {
      if (next === identity) return
      identity = next
      authRetried = false
      for (const channel of channels.values()) {
        channel.authRetried = false
        channel.disabled = false
      }
      forceToken = false
      attempt = 0
      abort()
      schedule()
    },
    subscribe(
      subscription: Omit<ApiReadSubscription, 'id'> & { access: ApiReadAccess },
      callbacks: Pick<Listener, 'change' | 'error'>
    ) {
      const key = `${subscription.url}|${subscription.language || ''}`
      let channel = channels.get(key)
      if (!channel) {
        if (channels.size >= API_READ_MAX_CHANNELS)
          throw new Error(
            'The active API read subscription budget was exceeded.'
          )
        channel = {
          ...subscription,
          id: `read-${++serial}`,
          failed: false,
          disabled: false,
          authRetried: false,
          listeners: new Set(),
        }
        const body = [...channels.values(), channel].map(
          ({ id, url, version, language }) => ({
            id,
            url,
            version,
            ...(language ? { language } : {}),
          })
        )
        if (
          new TextEncoder().encode(JSON.stringify(body)).byteLength >
          API_READ_MAX_BODY_BYTES
        )
          throw new Error('The active API read request budget was exceeded.')
        channels.set(key, channel)
        schedule()
      } else if (channel.access !== subscription.access)
        throw new Error('The API projection access scope changed unexpectedly.')
      const current = channel
      const listener: Listener = {
        ...callbacks,
        version: subscription.version,
        notified: '',
      }
      current.listeners.add(listener)
      let active = true
      if (subscription.version && current.disabled) {
        current.disabled = false
        current.authRetried = false
        schedule()
      }
      if (
        current.serverVersion &&
        current.serverVersion !== subscription.version
      )
        queueMicrotask(() => {
          if (!active || !current.serverVersion) return
          listener.notified = current.serverVersion
          listener.change(current.serverVersion)
        })
      return {
        update(version: string) {
          listener.version = version
          current.version = version
          if (current.failed && version) {
            current.disabled = false
            current.authRetried = false
            authRetried = false
            schedule()
          }
        },
        stop() {
          if (!active) return
          active = false
          current.listeners.delete(listener)
          if (!current.listeners.size) {
            channels.delete(key)
            schedule()
          }
        },
      }
    },
    stop() {
      channels.clear()
      abort()
    },
  }
}

export type ApiReadConnections = ReturnType<typeof createApiReadConnections>
