import {
  createError,
  createEventStream,
  defineEventHandler,
  getHeader,
  readBody,
} from 'h3'
import { liveResponseSink } from '../../utils/http/liveResponseSink'

/** One browser connection, with each projection retaining its own handler and authority. */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!Array.isArray(body?.reads) || body.reads.length > 100) {
    throw createError({ statusCode: 400, message: 'Invalid live reads.' })
  }
  const reads = body.reads.map((read: any) => {
    const url = new URL(String(read.url), 'http://local')
    if (
      url.origin !== 'http://local' ||
      !url.pathname.startsWith('/api/') ||
      url.pathname === '/api/fireux/live' ||
      url.username ||
      url.password
    ) {
      throw createError({ statusCode: 400, message: 'Invalid live read path.' })
    }
    return {
      id: String(read.id),
      url: url.pathname + url.search,
      headers: {
        authorization:
          typeof read.headers?.authorization === 'string'
            ? read.headers.authorization
            : '',
        'x-fireux-order-capability':
          typeof read.headers?.['x-fireux-order-capability'] === 'string'
            ? read.headers['x-fireux-order-capability']
            : '',
      },
    }
  })
  const stream = createEventStream(event)
  const stops = new Set<() => void>()
  let closed = false
  stream.onClosed(() => {
    closed = true
    stops.forEach((stop) => stop())
    stops.clear()
  })
  for (const read of reads) {
    let claimed = false
    let stopped = false
    let failed = false
    const push = async (message: { data: string; event?: string }) => {
      if (message.event === 'read-error') failed = true
      if (!closed && !stopped)
        await stream.push({ data: JSON.stringify({ id: read.id, ...message }) })
    }
    const sink = {
      push,
      onClosed(callback: () => void) {
        claimed = true
        if (closed) callback()
        else stops.add(callback)
      },
      async close() {
        if (!failed)
          await push({
            event: 'read-error',
            data: JSON.stringify({
              statusCode: 503,
              message: 'Live connection is renewing.',
            }),
          })
        stopped = true
      },
      send: () => null,
    }
    void liveResponseSink.run(sink, async () => {
      try {
        // Nitro's in-process fetch preserves routing/middleware. Only GET projections
        // participate; no client-selected host or arbitrary request headers are forwarded.
        await event.$fetch(read.url, {
          method: 'GET',
          headers: {
            accept: 'text/event-stream',
            ...read.headers,
            cookie: getHeader(event, 'cookie') || '',
          },
        })
        if (!claimed)
          await push({
            event: 'read-error',
            data: JSON.stringify({
              statusCode: 501,
              message: 'This endpoint does not support live reads.',
            }),
          })
      } catch {
        await push({
          event: 'read-error',
          data: JSON.stringify({
            statusCode: 503,
            message: 'Live data is unavailable.',
          }),
        })
      }
    })
  }
  return stream.send()
})
