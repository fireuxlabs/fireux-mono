import {
  createEventStream,
  defineEventHandler,
  getHeader,
  setResponseHeader,
  appendResponseHeader,
  H3Event,
} from 'h3'
import { ServerResponse } from 'node:http'
import { collectFirestoreReads } from '../firestore/live-read'

/** A normal HTTP projection with an opt-in, dependency-driven live response. */
export function defineLiveReadHandler<T>(
  read: (event: H3Event) => Promise<T> | T
) {
  return defineEventHandler(async (event) => {
    if (!getHeader(event, 'accept')?.includes('text/event-stream')) {
      const result = await read(event)
      setResponseHeader(event, 'Cache-Control', 'no-store')
      appendResponseHeader(event, 'Vary', 'Accept')
      return result
    }
    const stream = createEventStream(event)
    const subscriptions: { source: any; stop: () => void; used: boolean }[] = []
    let closed = false
    let running = false
    let dirty = false
    let previous = ''
    let lifetime: ReturnType<typeof setTimeout> | undefined
    const close = () => {
      if (lifetime) clearTimeout(lifetime)
      closed = true
      subscriptions.splice(0).forEach(({ stop }) => stop())
    }
    stream.onClosed(close)
    // Renew authenticated requests before their bearer token's ordinary expiry.
    lifetime = setTimeout(
      () => {
        close()
        void stream.close()
      },
      50 * 60 * 1000
    )
    lifetime.unref?.()
    async function update() {
      if (closed) return
      dirty = true
      if (running) return
      running = true
      try {
        while (dirty && !closed) {
          dirty = false
          subscriptions.forEach((item) => {
            item.used = false
          })
          // Each projection gets fresh response state; handlers may set JSON headers.
          const readEvent = new H3Event(
            event.node.req,
            new ServerResponse(event.node.req)
          )
          readEvent.context = { ...event.context }
          const result = await collectFirestoreReads(
            (source) => {
              const existing = subscriptions.find((item) => {
                try {
                  return item.source.isEqual(source)
                } catch {
                  return false
                }
              })
              if (existing) {
                existing.used = true
                return
              }
              const stop = source.onSnapshot(
                () => {
                  void update()
                },
                () => {
                  void fail(503)
                }
              )
              subscriptions.push({ source, stop, used: true })
            },
            async () => read(readEvent)
          )
          if (closed) break
          for (let i = subscriptions.length - 1; i >= 0; i--) {
            if (!subscriptions[i]!.used) subscriptions.splice(i, 1)[0]!.stop()
          }
          const data = JSON.stringify(result ?? null)
          if (data !== previous) {
            previous = data
            await stream.push({ data })
          }
        }
      } catch (error) {
        await fail(
          Number((error as { statusCode?: number })?.statusCode) || 503
        )
      } finally {
        running = false
      }
    }
    async function fail(statusCode: number) {
      if (closed) return
      await stream.push({
        event: 'read-error',
        data: JSON.stringify({
          statusCode,
          message: 'Live data is unavailable.',
        }),
      })
      close()
      await stream.close()
    }
    void update()
    return stream.send()
  })
}
