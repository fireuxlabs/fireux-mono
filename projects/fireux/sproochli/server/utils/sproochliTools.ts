import { setResponseHeaders, type H3Event } from 'h3'
import type { ToolProviderToolContract } from 'fireux-core/runtime/types/tool-provider.types'

export type SproochliToolId = 'menu'

export type SproochliToolContract = ToolProviderToolContract<SproochliToolId, 'sproochli'>

const tools = {
  menu: {
    id: 'menu',
    provider: 'sproochli',
    title: 'Menu translation',
    description: 'Translate menu copy for a consuming app.',
    messageSource: 'sproochli',
    endpoints: {
      translate: '/api/tools/menu/translate',
    },
    inputs: [
      'publicMenuUrl',
      'kitchenSlug',
      'menuId',
      'sourceLanguage',
      'targetLanguages',
      'fields',
    ],
    outputs: [
      'translations',
      'cache ids',
      'source hashes',
    ],
  },
} satisfies Record<SproochliToolId, SproochliToolContract>

export function sproochliTool(id: SproochliToolId) {
  return tools[id]
}

export function sproochliToolResponse(event: H3Event, id: SproochliToolId) {
  setSproochliToolHeaders(event)

  return {
    ok: true,
    tool: sproochliTool(id),
  }
}

export function setSproochliToolHeaders(event: H3Event) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  })
}
