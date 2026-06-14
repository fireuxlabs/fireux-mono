import type { H3Event } from 'h3'
import {
  defineToolProviderRegistry,
  toolProviderResponse,
} from 'fireux-core/runtime/server/utils/tool-provider.ts'
import { goQrDocBaseUrl } from './goQrDocs'
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

function toolForRequest(id: GoQrToolId): GoQrToolContract {
  const tool = registry.tool(id)
  if (id !== 'doc') return tool

  return {
    ...tool,
    preview: {
      ...docTool.preview,
      base_url: goQrDocBaseUrl(),
    },
  }
}

export function goQrToolResponse(event: H3Event, id: GoQrToolId) {
  return toolProviderResponse(event, toolForRequest(id))
}
