import { setResponseHeaders, type H3Event } from 'h3'

export type GoQrToolId = 'doc' | 'text'

export type GoQrToolContract = {
  id: GoQrToolId
  message: string
}

const tools = {
  doc: {
    id: 'doc',
    message: 'hello world',
  },
  text: {
    id: 'text',
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
