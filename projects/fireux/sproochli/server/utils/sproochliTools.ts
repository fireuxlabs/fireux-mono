import type { H3Event } from 'h3'
import {
  defineToolProviderRegistry,
  setToolProviderResponseHeaders,
} from 'fireux-core/runtime/server/utils/tool-provider'
import { menuTool } from './tools/menu'
import type { SproochliToolContract, SproochliToolId } from './tools/types'

const registry = defineToolProviderRegistry({
  provider: 'sproochli',
  tools: {
    menu: menuTool,
  } satisfies Record<SproochliToolId, SproochliToolContract>,
})

export function sproochliTool(id: SproochliToolId) {
  return registry.tool(id)
}

export function sproochliToolResponse(event: H3Event, id: SproochliToolId) {
  return registry.toolResponse(event, id)
}

export function setSproochliToolHeaders(event: H3Event) {
  setToolProviderResponseHeaders(event)
}
