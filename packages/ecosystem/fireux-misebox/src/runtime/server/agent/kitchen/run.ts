import type { H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireKitchenWriter } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { answerKitchenAgent } from './answer'
import { readKitchenAgentOrientation } from './orientation'
import { runKitchenTeamAI } from './team'
import type { KitchenAgentRequest } from './types'
import { runKitchenWasteAI } from './waste'

export async function runKitchenAgent(
  event: H3Event,
  request: KitchenAgentRequest
) {
  // The first capability handshake is deliberately unscoped: it reads no
  // Kitchen data and performs no action. Every other request remains guarded.
  const wasteResult = runKitchenWasteAI(request)
  if (wasteResult) return wasteResult

  if (!request.kitchenId) {
    const { uid } = await requireFirebaseBearerUser(
      event,
      'Sign in to work with KitchenAI without a selected Kitchen.'
    )
    const kitchens = await readKitchenAgentOrientation(uid)
    const names = kitchens.map((kitchen) => kitchen.name)
    const answer = !names.length
      ? 'You do not have a Kitchen yet. We can begin filling one in from a menu, a few details, or a blank Kitchen.'
      : names.length === 1
        ? `${names[0]} is available to you. Select it on this page when you want me to use its live evidence, or continue building from a blank Kitchen context.`
        : `You have ${names.length} Kitchens available: ${names.join(', ')}. Choose the Kitchen you want me to work with before asking me to use live operational evidence.`
    return {
      ok: true as const,
      answer,
      scope: {
        source: 'simulator' as const,
        kitchenName: 'No Kitchen selected',
        userContext: false,
        kitchenContext: false,
        menuContext: false,
        menuCount: 0,
        delegates: [],
        tipRecorded: false,
        usage: { amount: '0', currency: 'USD' },
      },
    }
  }

  const access = await requireKitchenWriter(event, {
    appId: request.appId,
    kitchenId: request.kitchenId,
  })
  const teamResult = await runKitchenTeamAI(event, request, access)
  return teamResult || answerKitchenAgent(event, request, access)
}
