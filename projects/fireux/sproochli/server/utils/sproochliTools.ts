import { setResponseHeaders, type H3Event } from 'h3'
import type { ToolProviderToolContract } from 'fireux-core/runtime/types/tool-provider.types'

export type SproochliToolId = 'menu'

export type SproochliToolContract = ToolProviderToolContract<SproochliToolId, 'sproochli'>

const tools = {
  menu: {
    id: 'menu',
    provider: 'sproochli',
    title: 'Menu translation',
    description: 'Prepare a menu translation handoff from a consuming app.',
    messageSource: 'sproochli',
    inputs: [
      'publicMenuUrl',
      'kitchenSlug',
      'menuId',
      'sourceLanguage',
      'targetLanguages',
      'readEndpoint',
      'saveEndpoint',
    ],
    outputs: [
      'translation plan',
      'review state',
      'future translation cache rows',
    ],
  },
} satisfies Record<SproochliToolId, SproochliToolContract>

export function sproochliTool(id: SproochliToolId) {
  return tools[id]
}

export function sproochliToolResponse(event: H3Event, id: SproochliToolId) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return {
    ok: true,
    tool: sproochliTool(id),
  }
}
