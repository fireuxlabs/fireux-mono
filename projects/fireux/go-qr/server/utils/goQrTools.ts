import { setResponseHeaders, type H3Event } from 'h3'

export type GoQrToolId = 'doc' | 'text'

export type GoQrToolContract = {
  id: GoQrToolId
  title: string
  description: string
  message?: string
  endpoints?: {
    create: string
    availability: string
  }
  preview?: {
    base_url: string
    path_suffix: string
  }
}

const tools = {
  doc: {
    id: 'doc',
    title: 'Doc',
    description: 'Upload a doc, choose a short path, and get a QR page.',
    endpoints: {
      create: '/api/tools/doc/create',
      availability: '/api/tools/doc/availability',
    },
    preview: {
      base_url: 'https://go-qr.web.app/doc',
      path_suffix: '/qr',
    },
  },
  text: {
    id: 'text',
    title: 'Text',
    description: 'Turn a short message into a shareable QR.',
    message: 'hello world',
  },
} satisfies Record<GoQrToolId, GoQrToolContract>

export function goQrTool(id: GoQrToolId) {
  return tools[id]
}

export function goQrToolResponse(event: H3Event, id: GoQrToolId) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return {
    ok: true,
    tool: goQrTool(id),
  }
}
