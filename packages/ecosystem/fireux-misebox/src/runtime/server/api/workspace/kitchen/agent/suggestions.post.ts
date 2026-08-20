import { defineEventHandler, readBody } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { runKitchenAgentSuggestions } from '../../../../agent/kitchen/suggestions'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Record<string, unknown> | null
  return runKitchenAgentSuggestions(event, {
    appId: requirePathSegment(body?.appId, 'App id'),
    kitchenId: requirePathSegment(body?.kitchenId, 'Kitchen id'),
    operation: requirePathSegment(body?.operation, 'Operation'),
  })
})
