import type { H3Event } from 'h3'
import { requireKitchenWriter } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { answerKitchenAgent } from './answer'
import { answerKitchenAgentOrientation } from './orientation-answer'
import { runKitchenTeamAI } from './team'
import type { KitchenAgentRequest } from './types'
import { selectKitchenWorkspaceAction } from './workspace-actions'

export async function runKitchenAgent(
  event: H3Event,
  request: KitchenAgentRequest
) {
  const workspaceAction = await selectKitchenWorkspaceAction(event, request)
  if (workspaceAction) {
    return {
      ok: true as const,
      answer: '',
      workspaceAction,
    }
  }
  if (!request.kitchenId) {
    return answerKitchenAgentOrientation(event, request)
  }

  const access = await requireKitchenWriter(event, {
    appId: request.appId,
    kitchenId: request.kitchenId,
  })
  const teamResult =
    request.operation === 'team'
      ? await runKitchenTeamAI(event, request, access)
      : null
  return teamResult || answerKitchenAgent(event, request, access)
}
