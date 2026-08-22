import type { H3Event } from 'h3'
import { requireKitchenWriter } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { answerKitchenAgent } from './answer'
import { runKitchenPurchasingAI } from './purchasing'
import { runKitchenTeamAgent } from './team'
import type { KitchenAgentRequest } from './types'

export async function runKitchenAgent(
  event: H3Event,
  request: KitchenAgentRequest
) {
  // The first capability handshake is deliberately unscoped: it reads no
  // Kitchen data and performs no action. Every other request remains guarded.
  const purchasingResult = runKitchenPurchasingAI(request)
  if (purchasingResult) return purchasingResult

  const access = await requireKitchenWriter(event, {
    appId: request.appId,
    kitchenId: request.kitchenId,
  })
  const teamResult = await runKitchenTeamAgent(event, request, access)
  return teamResult || answerKitchenAgent(event, request, access)
}
