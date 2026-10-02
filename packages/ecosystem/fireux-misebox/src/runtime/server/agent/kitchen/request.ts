import { createError, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { pendingTeamTool } from './team-tools'
import type { KitchenAgentRequest, KitchenWorkspaceActionId } from './types'
import {
  findMiseboxOperationAgent,
  findMiseboxWorkspaceAgent,
} from '../../../models/workspace-agents'

const PROMPT_MAX_LENGTH = 2_000
const text = (value: unknown) => String(value ?? '').trim()
const workspaceActionIds = new Set<KitchenWorkspaceActionId>([
  'create-kitchen',
  'complete-kitchen',
  'sign-up',
  'explore-misebox',
])

function readPrompt(value: unknown) {
  const prompt = text(value)
  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A Kitchen question is required.',
    })
  }
  if (prompt.length > PROMPT_MAX_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kitchen questions must not exceed ${PROMPT_MAX_LENGTH} characters.`,
    })
  }
  return prompt
}

export async function readKitchenAgentRequest(
  event: H3Event
): Promise<KitchenAgentRequest> {
  const body = (await readBody(event)) as Record<string, unknown> | null
  const prompt = readPrompt(body?.prompt)
  const operation = text(body?.operation)
  const operationAgent = operation
    ? findMiseboxOperationAgent('kitchen', operation)
    : undefined
  const operationAgents = operationAgent
    ? [operationAgent]
    : findMiseboxWorkspaceAgent('kitchen')?.operationAgents || []
  const allowedActions = new Set<string>([
    ...workspaceActionIds,
    ...operationAgents.flatMap((agent) =>
      (agent.toolCatalogue || [])
        .filter(
          (tool) =>
            tool.status === 'available' || tool.status === 'agent-ready'
        )
        .map((tool) => tool.id)
    ),
  ])
  const actionTargets = (
    Array.isArray(body?.actionTargets) ? body.actionTargets : []
  )
    .slice(0, 50)
    .flatMap((candidate) => {
      if (!candidate || typeof candidate !== 'object') return []
      const source = candidate as Record<string, unknown>
      const actionId = text(source.actionId)
      const targetId = text(source.targetId)
      const label = text(source.label).slice(0, 160)
      if (
        !allowedActions.has(actionId) ||
        !targetId ||
        targetId.includes('/') ||
        !label
      )
        return []
      return [{ actionId, targetId, label }]
    })
  return {
    appId: requirePathSegment(body?.appId, 'App id'),
    kitchenId: text(body?.kitchenId),
    prompt,
    operation,
    pendingTool: pendingTeamTool(body?.pendingTool),
    availableActions: Array.from(
      new Set(
        (Array.isArray(body?.availableActions) ? body.availableActions : [])
          .map(text)
          .filter((id) => allowedActions.has(id))
      )
    ),
    actionTargets,
  }
}
