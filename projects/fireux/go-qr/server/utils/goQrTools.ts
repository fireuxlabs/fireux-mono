import type { H3Event } from 'h3'
import { getRequestHeader, getRequestURL } from 'h3'
import {
  defineToolProviderRegistry,
  toolProviderResponse,
} from 'fireux-core/runtime/server/utils/tool-provider.ts'
import { docTool } from './tools/doc'
import { textTool } from './tools/text'
import { urlTool } from './tools/url'
import type { GoQrToolContract, GoQrToolId } from './tools/types'

const registry = defineToolProviderRegistry({
  provider: 'go-qr',
  tools: {
    doc: docTool,
    text: textTool,
    url: urlTool,
  } satisfies Record<GoQrToolId, GoQrToolContract>,
})

export function goQrTool(id: GoQrToolId) {
  return registry.tool(id)
}

function requestOrigin(event: H3Event) {
  const host = (
    getRequestHeader(event, 'x-forwarded-host') ||
    getRequestHeader(event, 'host') ||
    ''
  ).trim()
  const proto = (
    getRequestHeader(event, 'x-forwarded-proto') ||
    getRequestURL(event).protocol.replace(':', '') ||
    'https'
  ).trim()

  return host ? `${proto}://${host}` : getRequestURL(event).origin
}

function toolForRequest(event: H3Event, id: GoQrToolId): GoQrToolContract {
  const tool = registry.tool(id)
  if (id !== 'doc') return tool

  return {
    ...tool,
    preview: {
      ...docTool.preview,
      base_url: `${requestOrigin(event)}/doc`,
    },
  }
}

export function goQrToolResponse(event: H3Event, id: GoQrToolId) {
  return toolProviderResponse(event, toolForRequest(event, id))
}
