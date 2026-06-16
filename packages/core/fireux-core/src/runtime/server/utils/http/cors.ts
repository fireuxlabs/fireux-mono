import { setResponseHeaders, type H3Event } from 'h3'

type CorsMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

type CorsHeaderOptions = {
  methods: CorsMethod[]
  headers?: string[]
  origin?: string
  contentType?: string
  cacheControl?: string
}

const unique = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))

export function setCorsHeaders(event: H3Event, options: CorsHeaderOptions) {
  const methods = unique([...options.methods, 'OPTIONS'])
  const headers = unique(options.headers ?? ['content-type'])
  const responseHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': options.origin ?? '*',
    'Access-Control-Allow-Methods': methods.join(', '),
    'Access-Control-Allow-Headers': headers.join(','),
  }

  if (options.contentType) {
    responseHeaders['Content-Type'] = options.contentType
  }

  if (options.cacheControl) {
    responseHeaders['Cache-Control'] = options.cacheControl
  }

  setResponseHeaders(event, responseHeaders)
}
