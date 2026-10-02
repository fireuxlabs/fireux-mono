import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import type { KitchenAgentRequest, KitchenWorkspaceActionId } from './types'
import {
  findMiseboxOperationAgent,
  findMiseboxWorkspaceAgent,
} from '../../../models/workspace-agents'

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
  if (!request.availableActions.length) return null
  const operationAgent = request.operation
    ? findMiseboxOperationAgent('kitchen', request.operation)
    : undefined
  const operationAgents = operationAgent
    ? [operationAgent]
    : findMiseboxWorkspaceAgent('kitchen')?.operationAgents || []
  const capabilityDefinitions = new Map(
    operationAgents.flatMap((agent) =>
      (agent.toolCatalogue || []).map((tool) => [
        tool.id,
        { label: tool.label, description: tool.description },
      ] as const)
    )
  )
  const targetedActionIds = new Set(
    request.actionTargets.map((target) => target.actionId)
  )
  const available = request.availableActions
    .filter((id) => !targetedActionIds.has(id))
    .map((id) => ({
      selectionId: id,
      actionId: id,
      ...(definitions[id as KitchenWorkspaceActionId] ||
        capabilityDefinitions.get(id)),
    }))
    .filter(
      (action): action is {
        selectionId: string
        actionId: string
        label: string
        description: string
      } =>
        Boolean(action.label && action.description)
    )
  const targeted = request.actionTargets.flatMap((target) => {
    const definition = capabilityDefinitions.get(target.actionId)
    if (!definition) return []
    return [
      {
        selectionId: `${target.actionId}:${target.targetId}`,
        actionId: target.actionId,
        targetId: target.targetId,
        label: `${definition.label}: ${target.label}`,
        description: definition.description,
      },
    ]
  })
  const candidates = [...available, ...targeted]
  if (!candidates.length) return null
  const result = await useFireuxAi(event).generateJson<{
    kind: 'action' | 'none'
    selectionId?: string
  }>({
    appId: request.appId,
    task: 'extract_structured_data',
    timeoutMs: 60_000,
    input: {
      simulator_kind: 'kitchen_workspace_action_selection',
      request: request.prompt,
      available_actions: candidates,
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
        selectionId: {
          type: 'string',
          enum: candidates.map((candidate) => candidate.selectionId),
        },
      },
      required: ['kind'],
      additionalProperties: false,
    },
  })
  const selectionId = result.ok ? result.data?.selectionId : undefined
  const selected = candidates.find(
    (candidate) => candidate.selectionId === selectionId
  )
  return result.ok && result.data?.kind === 'action' && selected
    ? {
        id: selected.actionId,
        ...('targetId' in selected ? { targetId: selected.targetId } : {}),
      }
    : null
}
