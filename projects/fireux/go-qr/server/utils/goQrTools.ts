import type { H3Event } from 'h3'
import { defineToolProviderRegistry } from 'fireux-core/runtime/server/utils/tool-provider'
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

export function goQrToolResponse(event: H3Event, id: GoQrToolId) {
  return registry.toolResponse(event, id)
}
