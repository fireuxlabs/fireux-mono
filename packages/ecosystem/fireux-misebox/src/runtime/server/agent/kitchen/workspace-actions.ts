import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import type { KitchenAgentRequest, KitchenWorkspaceActionId } from './types'

const definitions: Record<
  KitchenWorkspaceActionId,
  { label: string; description: string }
> = {
  'create-kitchen': {
    label: 'Create Kitchen',
    description: 'Open the form for creating a Kitchen.',
  },
  'complete-kitchen': {
    label: 'Complete Kitchen',
    description: 'Open onboarding for the current incomplete Kitchen.',
  },
  'sign-up': {
    label: 'Sign up',
    description: 'Open account registration for the current guest.',
  },
  'explore-misebox': {
    label: 'Explore Misebox',
    description: 'Open the Misebox product information page.',
  },
}

export async function selectKitchenWorkspaceAction(
  event: H3Event,
  request: KitchenAgentRequest
) {
  if (request.operation || !request.availableActions.length) return null
  const available = request.availableActions.map((id) => ({
    id,
    ...definitions[id],
  }))
  const result = await useFireuxAi(event).generateJson<{
    kind: 'action' | 'none'
    actionId?: KitchenWorkspaceActionId
  }>({
    appId: request.appId,
    task: 'extract_structured_data',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_workspace_action_selection',
      request: request.prompt,
      available_actions: available,
    },
    context: {
      agent: 'KitchenAI',
      instruction:
        'Understand the user request and select one available Workspace action only when it fulfills the request. Interpret natural language rather than matching phrases. Return none when the user is asking a question or no action clearly applies. Never select an action that is not supplied.',
    },
    outputJsonSchema: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['action', 'none'] },
        actionId: {
          type: 'string',
          enum: request.availableActions,
        },
      },
      required: ['kind'],
      additionalProperties: false,
    },
  })
  const actionId = result.ok ? result.data?.actionId : undefined
  return result.ok && result.data?.kind === 'action' && actionId
    ? actionId
    : null
}
