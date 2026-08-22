import { isPurchasingAIHelloPrompt } from 'fireux-kitchens/runtime/kitchen/models/purchasing-ai'
import { helloFromPurchasingAI } from 'fireux-kitchens/runtime/kitchen/server/ai/purchasing'
import type { KitchenAgentRequest } from './types'

export function runKitchenPurchasingAI(request: KitchenAgentRequest) {
  const operation = request.operation.trim()
  const requested =
    operation === 'purchasing' ||
    (!operation && isPurchasingAIHelloPrompt(request.prompt))

  if (!requested) return null

  const child = helloFromPurchasingAI()
  return {
    ok: true as const,
    answer: `${child.agent} says hello.`,
    scope: {
      source: 'simulator' as const,
      kitchenName: request.kitchenId || 'No Kitchen selected',
      userContext: false,
      kitchenContext: false,
      menuContext: false,
      menuCount: 0,
      delegates: [child.agent],
      tipRecorded: false,
      usage: { amount: '0', currency: 'USD' },
    },
  }
}
