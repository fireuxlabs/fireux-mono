type Projection = {
  id: string
  url: string
  headers: {
    authorization: string
    'x-fireux-order-capability': string
  }
  readers: Set<ReadableStreamDefaultController<Uint8Array>>
  lastFrame: string
  snapshot?: AbortController
}

const projections = new Map<string, Projection>()
let sequence = 0
let transport: AbortController | undefined
let scheduled: ReturnType<typeof setTimeout> | undefined
let activeEndpoint = '/api/fireux/live'
let observingVisibility = false
let cycleTimer: ReturnType<typeof setTimeout> | undefined
const boundedHttp = () => typeof window !== 'undefined' && window.location.protocol === 'http:'
const hidden = () => typeof document !== 'undefined' && document.visibilityState === 'hidden'
function visibilityChanged() {
  reconnect(activeEndpoint)
}
function publish(projection: Projection, frame: string) {
  projection.lastFrame = frame
  const bytes = new TextEncoder().encode(frame)
  projection.readers.forEach(controller => controller.enqueue(bytes))
}
async function initialBackgroundSnapshot(identity: string, projection: Projection) {
  if (projection.lastFrame || projection.snapshot) return
  const abort = new AbortController()
  projection.snapshot = abort
  const timeout = setTimeout(() => abort.abort(), 15000)
  try {
    const response = await fetch(projection.url, {
      headers: projection.headers,
      credentials: 'same-origin',
      cache: 'no-store',
      signal: abort.signal,
    })
    if (projections.get(identity) !== projection || projection.lastFrame) return
    if (!response.ok) {
      publish(projection, `event: read-error\ndata: ${JSON.stringify({statusCode: response.status, message: 'Live data is unavailable.'})}\n\n`)
      return
    }
    const value = await response.json()
    if (projections.get(identity) === projection && !projection.lastFrame)
      publish(projection, `data: ${JSON.stringify(value)}\n\n`)
  } catch (error) {
    if (projections.get(identity) === projection && !projection.lastFrame && hidden()) {
      projection.readers.forEach(controller => controller.error(error))
      projection.readers.clear()
      projections.delete(identity)
      reconnect(activeEndpoint)
    }
  } finally {
    clearTimeout(timeout)
    projection.snapshot = undefined
  }
}

function reconnect(endpoint: string) {
  activeEndpoint = endpoint
  if (cycleTimer) clearTimeout(cycleTimer)
  cycleTimer = undefined
  if (typeof document !== 'undefined') {
    if (projections.size && !observingVisibility) {
      document.addEventListener('visibilitychange', visibilityChanged)
      observingVisibility = true
    } else if (!projections.size && observingVisibility) {
      document.removeEventListener('visibilitychange', visibilityChanged)
      observingVisibility = false
    }
  }
  if (scheduled) clearTimeout(scheduled)
  // Close before opening the replacement: HTTP/1 must retain room for page assets.
  transport?.abort()
  transport = undefined
  if (hidden()) {
    projections.forEach((projection, identity) => { void initialBackgroundSnapshot(identity, projection) })
    return
  }
  projections.forEach(projection => projection.snapshot?.abort())
  scheduled = setTimeout(() => {
    scheduled = undefined
    if (!projections.size) return
    const abort = new AbortController()
    transport = abort
    const active = new Map(
      [...projections.values()].map((value) => [value.id, value])
    )
    const awaiting = new Set(active.keys())
    const releaseHttpSlot = () => {
      if (transport !== abort || !projections.size) return
      abort.abort()
      if (cycleTimer) clearTimeout(cycleTimer)
      cycleTimer = setTimeout(() => reconnect(endpoint), 4000)
    }
    if (boundedHttp()) cycleTimer = setTimeout(releaseHttpSlot, 10000)
    void consume()
    async function consume() {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            accept: 'text/event-stream',
          },
          credentials: 'same-origin',
          signal: abort.signal,
          body: JSON.stringify({
            reads: [...active.values()].map(({ id, url, headers }) => ({
              id,
              url,
              headers,
            })),
          }),
        })
        if (
          !response.ok ||
          !response.headers.get('content-type')?.includes('text/event-stream')
        )
          throw new Error('Live stream could not be opened.')
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        try {
          while (!abort.signal.aborted) {
            const chunk = await reader.read()
            if (chunk.done) throw new Error('Live stream closed.')
            buffer += decoder
              .decode(chunk.value, { stream: true })
              .replaceAll('\r\n', '\n')
            let boundary: number
            while ((boundary = buffer.indexOf('\n\n')) >= 0) {
              const frame = buffer.slice(0, boundary)
              buffer = buffer.slice(boundary + 2)
              const data = frame
                .split('\n')
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.slice(5).trimStart())
                .join('\n')
              if (!data) continue
              const message = JSON.parse(data)
              const projection = active.get(message.id)
              if (!projection) continue
              publish(projection, `${message.event ? `event: ${message.event}\n` : ''}data: ${message.data}\n\n`)
              awaiting.delete(message.id)
              if (boundedHttp() && !awaiting.size) {
                releaseHttpSlot()
                return
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      } catch (error) {
        if (abort.signal.aborted) return
        for (const [identity, projection] of projections) {
          if (active.get(projection.id) !== projection) continue
          projection.readers.forEach((controller) => controller.error(error))
          projection.readers.clear()
          projections.delete(identity)
        }
      }
    }
  }, 0)
}

/** All active projections share one connection; identical reads also share their projection. */
export async function sharedLiveResponse(
  url: URL,
  options: { headers: Headers; signal: AbortSignal; endpoint?: string }
): Promise<Response> {
  const endpoint = options.endpoint || '/api/fireux/live'
  const headers = {
    authorization: options.headers.get('authorization') || '',
    'x-fireux-order-capability':
      options.headers.get('x-fireux-order-capability') || '',
  }
  const identity = `${url.href}:${JSON.stringify(headers)}`
  let projection = projections.get(identity)
  if (!projection) {
    projection = {
      id: String(++sequence),
      url: url.pathname + url.search,
      headers,
      readers: new Set(),
      lastFrame: '',
    }
    projections.set(identity, projection)
    reconnect(endpoint)
  }
  const owner = projection
  let controller: ReadableStreamDefaultController<Uint8Array>
  const release = () => {
    options.signal.removeEventListener('abort', onAbort)
    owner.readers.delete(controller)
    if (!owner.readers.size && projections.get(identity) === owner) {
      owner.snapshot?.abort()
      projections.delete(identity)
      reconnect(endpoint)
    }
  }
  const onAbort = () => {
    if (owner.readers.has(controller))
      controller.error(new Error('Live reader disposed.'))
    release()
  }
  const body = new ReadableStream<Uint8Array>({
    start(value) {
      controller = value
      owner.readers.add(value)
      if (owner.lastFrame)
        value.enqueue(new TextEncoder().encode(owner.lastFrame))
    },
    cancel: release,
  })
  options.signal.addEventListener('abort', onAbort, { once: true })
  if (options.signal.aborted) onAbort()
  return new Response(body, {
    headers: { 'content-type': 'text/event-stream' },
  })
}
