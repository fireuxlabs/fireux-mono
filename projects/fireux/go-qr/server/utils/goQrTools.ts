import { setResponseHeaders, type H3Event } from 'h3'

export type GoQrToolId = 'doc' | 'text'

export type GoQrToolContract = {
  id: GoQrToolId
  title: string
  description: string
  message: string
}

const tools = {
  doc: {
    id: 'doc',
    title: 'Doc',
    description: 'Upload a doc, choose a short path, and get a QR page.',
    message: 'hello world',
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
