import {
  createError,
  createEventStream,
  getHeader,
  getRequestURL,
  getRequestWebStream,
  type H3Event,
} from 'h3'
import {
  API_READ_MAX_BODY_BYTES,
  API_READ_MAX_CHANNELS,
  apiReadUrl,
  apiReadVersion,
  type ApiReadEvent,
  type ApiReadSubscription,
} from '../../utils/api-read-protocol'
import { firebaseBearerUser } from './auth/bearer'
import { captureLiveProjection } from './live-projection'
import {
  liveProjectionFailure,
  subscribeLiveProjection,
} from './live-projection-subscription'

async function readSubscriptions(
  event: H3Event
): Promise<ApiReadSubscription[]> {
  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (contentLength > API_READ_MAX_BODY_BYTES)
    throw createError({
      statusCode: 413,
      statusMessage: 'Live read request is too large.',
    })
  const body = getRequestWebStream(event)
  if (!body)
    throw createError({
      statusCode: 400,
      statusMessage: 'Live read subscriptions are required.',
    })
  const reader = body.getReader(),
    decoder = new TextDecoder()
  let size = 0,
    text = ''
  try {
    for (;;) {
      const next = await reader.read()
      if (next.done) break
      size += next.value.byteLength
      if (size > API_READ_MAX_BODY_BYTES) {
        await reader.cancel()
        throw createError({
          statusCode: 413,
          statusMessage: 'Live read request is too large.',
        })
      }
      text += decoder.decode(next.value, { stream: true })
    }
    text += decoder.decode()
  } finally {
    reader.releaseLock()
  }
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid live read request.',
    })
  }
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > API_READ_MAX_CHANNELS
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid live read subscription count.',
    })
  const ids = new Set<string>(),
    urls = new Set<string>()
  return value.map((input) => {
    if (!input || typeof input !== 'object' || Array.isArray(input))
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid live read subscription.',
      })
    const row = input as Record<string, unknown>
    if (
      Object.keys(row).some(
        (key) => !['id', 'url', 'version', 'language'].includes(key)
      ) ||
      typeof row.id !== 'string' ||
      !/^[\w-]{1,64}$/.test(row.id) ||
      ids.has(row.id) ||
      typeof row.url !== 'string' ||
      !row.url.startsWith('/') ||
      row.url.startsWith('//') ||
      typeof row.version !== 'string' ||
      (row.version !== '' && !apiReadVersion(row.version)) ||
      (row.language !== undefined &&
        (typeof row.language !== 'string' ||
          row.language.length > 160 ||
          /[\r\n]/.test(row.language)))
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid live read subscription.',
      })
    let url: string
    try {
      url = apiReadUrl(row.url)
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Live reads require a same-origin API GET.',
      })
    }
    const representation = `${url}|${row.language || ''}`
    if (urls.has(representation))
      throw createError({
        statusCode: 400,
        statusMessage: 'Duplicate live read subscription.',
      })
    ids.add(row.id)
    urls.add(representation)
    return {
      id: row.id,
      url,
      version: row.version,
      ...(row.language ? { language: String(row.language) } : {}),
    }
  })
}

/** One native H3 stream multiplexes every supported read in this browser App scope. */
export async function serveLiveProjectionFeed(event: H3Event) {
  const origin = getHeader(event, 'origin')
  if (origin) {
    let sameOrigin = false
    try {
      sameOrigin = new URL(origin).origin === getRequestURL(event).origin
    } catch {
      /* invalid origin */
    }
    if (!sameOrigin)
      throw createError({
        statusCode: 403,
        statusMessage: 'Live reads require the App origin.',
      })
  }
  const subscriptions = await readSubscriptions(event)
  const stream = createEventStream(event)
  const controllers = new Set<ReturnType<typeof subscribeLiveProjection>>()
  const dispatch = new AbortController()
  let closed = false
  let leasePromise: Promise<void> | undefined
  let lease: ReturnType<typeof setTimeout> | undefined
  let heartbeat: ReturnType<typeof setInterval> | undefined
  const pending = new Map<string, ApiReadEvent>()
  let writing = false

  async function close() {
    if (closed) return
    closed = true
    dispatch.abort()
    clearTimeout(lease)
    clearInterval(heartbeat)
    pending.clear()
    for (const controller of controllers) controller.stop()
    controllers.clear()
    await stream.close()
  }
  async function drain() {
    if (writing || closed) return
    writing = true
    try {
      while (!closed && pending.size) {
        const [key, message] = pending.entries().next().value!
        pending.delete(key)
        await stream.push({ data: JSON.stringify(message) })
      }
    } catch {
      await close()
    } finally {
      writing = false
    }
  }
  function send(message: ApiReadEvent) {
    if (closed) return
    // Slow readers retain only the latest state of each bounded channel.
    const key = 'id' in message ? message.id : message.type
    pending.set(key, message)
    void drain()
  }
  function requireProtectedLease() {
    leasePromise ??= (async () => {
      const actor = await firebaseBearerUser(event).catch(() => null)
      if (!actor)
        throw createError({
          statusCode: 401,
          statusMessage: 'Sign in to continue this live read.',
        })
      if (closed) return
      // Auth disable/revocation is bounded by this lease; membership/grant watches are immediate.
      const duration = Math.max(
        0,
        Math.min(60_000, actor.decoded.exp * 1000 - Date.now())
      )
      lease = setTimeout(() => {
        send({ type: 'reauth' })
        void close()
      }, duration)
    })()
    return leasePromise
  }

  stream.onClosed(close)
  heartbeat = setInterval(() => {
    send({ type: 'ping' })
  }, 15_000)
  for (const subscription of subscriptions) {
    void (async () => {
      try {
        const headers: Record<string, string> = { accept: 'application/json' }
        for (const name of ['authorization', 'cookie']) {
          const value = getHeader(event, name)
          if (value) headers[name] = value
        }
        const language =
          subscription.language || getHeader(event, 'accept-language')
        if (language) headers['accept-language'] = language
        const projection = await captureLiveProjection(subscription.url, () =>
          $fetch.raw(subscription.url, {
            method: 'GET',
            headers,
            signal: dispatch.signal,
            retry: 0,
          })
        )
        if (closed) return
        if (projection.access === 'protected') await requireProtectedLease()
        if (closed) return
        const controller = subscribeLiveProjection({
          id: subscription.id,
          version: subscription.version,
          projection,
          send,
        })
        controllers.add(controller)
      } catch (cause) {
        if (!closed)
          send({
            type: 'error',
            id: subscription.id,
            ...liveProjectionFailure(cause),
          })
      }
    })()
  }
  return stream.send()
}
