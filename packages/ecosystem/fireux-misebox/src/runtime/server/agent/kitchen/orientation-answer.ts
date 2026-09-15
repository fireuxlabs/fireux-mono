import { createError, type H3Event } from 'h3'
import { firebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import {
  findMiseboxOperationAgent,
  findMiseboxWorkspaceAgent,
} from '../../../ai/workspace-agents'
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
    ? await readKitchenAgentOrientation(identity.uid, request.appId)
    : []
  const createKitchenAvailable =
    request.availableActions.includes('create-kitchen')
  const response = await useFireuxAi(event).generateText({
    appId: request.appId,
    task: 'summarise_text',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_orientation',
      question: request.prompt,
      selection: { state: 'none', kitchen_evidence: 'not-supplied' },
      available_kitchens: kitchens,
      workspace_entry: {
        known_kitchen_count: kitchens.length,
        create_kitchen_action_available: createKitchenAvailable,
        entitlement_evidence: 'not-supplied',
        multi_kitchen_policy: {
          free: 'one Kitchen',
          premium: 'one Kitchen',
          business: 'multiple Kitchens',
        },
        current_product_state:
          'Misebox /workspace/kitchen is the Kitchen Workspace root. This is where a Business subscriber can create and manage multiple Kitchens. A second Kitchen requires Business.',
      },
      workspace_agent: buildKitchenCoordinatorContext(operationAgents),
    },
    context: {
      agent: workspaceAgent?.name || 'KitchenAI',
      instruction:
        'Answer naturally from the registered capability context, available Kitchen identity list, and Workspace-entry facts. Lead with a direct plain-language answer to the user’s question, then explain any important limitation or next step. For subscription-limit questions, state the applicable limit and upgrade path in no more than two sentences; do not discuss action availability unless the user asks how to perform the action. State supplied subscription policy directly, but never infer the user’s current subscription when entitlement evidence is not supplied. Kitchen selection controls access to live Kitchen records; it does not explain subscription limits or capability availability. Do not expose internal terms such as capability context, identity context, evidence envelope, registered agent, or entitlement evidence. Do not return JSON or a fenced block unless the user asks for it. No selected Kitchen evidence is supplied, so do not claim to inspect or change a Kitchen. Treat action availability as current UI evidence, not proof of permanent product policy. Do not imply that another product surface is required when the supplied facts identify this Workspace as the correct surface. Do not use canned replies or phrase matching. State a selection need only when the question requires live Kitchen evidence or a Kitchen-scoped action. Be concise and conversational.',
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
