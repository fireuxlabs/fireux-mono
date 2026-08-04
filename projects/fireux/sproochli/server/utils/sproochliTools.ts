import { setResponseHeaders, type H3Event } from 'h3'
import {
  defineToolProviderRegistry,
  setToolProviderResponseHeaders,
} from 'fireux-core/runtime/server/utils/tool-provider'
import { languageTriggerTool } from './tools/language-trigger'
import { menuTool } from './tools/menu'
import type { SproochliToolContract, SproochliToolId } from './tools/types'

const registry = defineToolProviderRegistry({
  provider: 'sproochli',
  tools: {
    'language-trigger': languageTriggerTool,
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

export function setSproochliPrivateToolHeaders(event: H3Event) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
}
