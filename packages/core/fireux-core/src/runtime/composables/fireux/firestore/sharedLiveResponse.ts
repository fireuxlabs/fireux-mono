type Projection = {
  id: string
  url: string
  headers: {
    authorization: string
    'x-fireux-order-capability': string
  }
  readers: Set<ReadableStreamDefaultController<Uint8Array>>
  lastFrame: string
}

const projections = new Map<string, Projection>()
let sequence = 0
let transport: AbortController | undefined
let scheduled: ReturnType<typeof setTimeout> | undefined

function reconnect(endpoint: string) {
  if (scheduled) clearTimeout(scheduled)
  // Close before opening the replacement: HTTP/1 must retain room for page assets.
  transport?.abort()
  transport = undefined
  scheduled = setTimeout(() => {
    scheduled = undefined
    if (!projections.size) return
    const abort = new AbortController()
    transport = abort
    const active = new Map(
      [...projections.values()].map((value) => [value.id, value])
    )
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
              projection.lastFrame = `${message.event ? `event: ${message.event}\n` : ''}data: ${message.data}\n\n`
              const bytes = new TextEncoder().encode(projection.lastFrame)
              projection.readers.forEach((controller) =>
                controller.enqueue(bytes)
              )
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
