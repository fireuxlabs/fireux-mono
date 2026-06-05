import { setResponseHeaders, type H3Event } from 'h3'
import type { ToolProviderToolContract } from 'fireux-core/runtime/types/tool-provider.types'

export type GoQrToolId = 'doc' | 'text' | 'url'

export type GoQrToolContract = ToolProviderToolContract<GoQrToolId, 'go-qr'>

const tools = {
  doc: {
    id: 'doc',
    provider: 'go-qr',
    messageSource: 'go-qr',
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
    provider: 'go-qr',
    messageSource: 'go-qr',
    title: 'Text',
    description: 'Turn a short message into a shareable QR.',
    message: 'hello world',
  },
  url: {
    id: 'url',
    provider: 'go-qr',
    messageSource: 'go-qr',
    title: 'URL',
    description: 'Create a QR code from any public URL.',
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
