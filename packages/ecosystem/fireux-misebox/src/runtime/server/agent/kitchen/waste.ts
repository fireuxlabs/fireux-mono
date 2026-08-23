import { isWasteAIHelloPrompt } from 'fireux-kitchens/runtime/kitchen/models/waste-ai'
import { wasteAIContext } from 'fireux-kitchens/runtime/kitchen/models/waste-ai'
import { helloFromWasteAI } from 'fireux-kitchens/runtime/kitchen/server/ai/waste'
import type { KitchenAgentRequest } from './types'

export function runKitchenWasteAI(request: KitchenAgentRequest) {
  const operation = request.operation.trim()
  const requested =
    operation === 'waste' || (!operation && isWasteAIHelloPrompt(request.prompt))

  if (!requested) return null

  const expert = helloFromWasteAI(wasteAIContext)
  return {
    ok: true as const,
    answer: `${expert.agent} says hello.\n\nTemporary context received: ${expert.context.summary}`,
    scope: {
      source: 'simulator' as const,
      kitchenName: request.kitchenId || 'No Kitchen selected',
      userContext: false,
      kitchenContext: false,
      menuContext: false,
      menuCount: 0,
      delegates: [expert.agent],
      tipRecorded: false,
      usage: { amount: '0', currency: 'USD' },
    },
  }
}
