import type { H3Event } from 'h3'
import { defineToolProviderRegistry } from 'fireux-core/runtime/server/utils/tool-provider.ts'
import { orderingTool } from './tools/ordering'
import type { MiseboxToolContract, MiseboxToolId } from './tools/types'

const registry = defineToolProviderRegistry({
  provider: 'misebox',
  tools: {
    ordering: orderingTool,
  } satisfies Record<MiseboxToolId, MiseboxToolContract>,
})

export function miseboxTool(id: MiseboxToolId) {
  return registry.tool(id)
}

export function miseboxToolResponse(event: H3Event, id: MiseboxToolId) {
  return registry.toolResponse(event, id)
}
