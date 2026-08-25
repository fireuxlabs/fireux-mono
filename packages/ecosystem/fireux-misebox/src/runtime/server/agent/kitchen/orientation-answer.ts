import { createError, type H3Event } from 'h3'
import { firebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { findMiseboxOperationAgent, findMiseboxWorkspaceAgent } from '../../../ai/workspace-agents'
import { readKitchenAgentOrientation } from './orientation'
import { buildKitchenCoordinatorContext } from './operations/coordinator'
import type { KitchenAgentRequest } from './types'

const text = (value: unknown) => String(value ?? '').trim()

export async function answerKitchenAgentOrientation(
  event: H3Event,
  request: KitchenAgentRequest
) {
  const identity = await firebaseBearerUser(event, { allowAnonymous: true })
  const workspaceAgent = findMiseboxWorkspaceAgent('kitchen')
  const requestedAgent = request.operation
    ? findMiseboxOperationAgent('kitchen', request.operation)
    : undefined
  const operationAgents = requestedAgent
    ? [requestedAgent]
    : workspaceAgent?.operationAgents || []
  const kitchens = identity?.uid
    ? await readKitchenAgentOrientation(identity.uid)
    : []
  const response = await useFireuxAi(event).generateText({
    appId: request.appId,
    task: 'summarise_text',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_orientation',
      question: request.prompt,
      selection: { state: 'none', kitchen_evidence: 'not-supplied' },
      available_kitchens: kitchens,
      workspace_agent: buildKitchenCoordinatorContext(operationAgents),
    },
    context: {
      agent: workspaceAgent?.name || 'KitchenAI',
      instruction:
        'Answer naturally from the registered capability context and available Kitchen identity list. No selected Kitchen evidence is supplied, so do not claim to inspect or change a Kitchen. Do not use canned replies or phrase matching. State a selection need only when the question requires live Kitchen evidence or a Kitchen-scoped action. Be concise and conversational.',
    },
  })
  const answer = text(response.text)
  if (!response.ok || !answer) {
    throw createError({
      statusCode: response.disabled ? 503 : 502,
      statusMessage: response.reason || 'KitchenAI could not answer.',
    })
  }
  return {
    ok: true as const,
    answer,
    scope: {
      source:
        response.execution === 'simulator'
          ? ('simulator' as const)
          : response.execution === 'codex'
            ? ('codex' as const)
            : ('ai' as const),
      kitchenName: 'No Kitchen selected',
      userContext: Boolean(identity),
      kitchenContext: false,
      menuContext: false,
      menuCount: 0,
      delegates: operationAgents.map((agent) => agent.name),
      tipRecorded: false,
      usage: { amount: '0', currency: 'USD' },
    },
  }
}
