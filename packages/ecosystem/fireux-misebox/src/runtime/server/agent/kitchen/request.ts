import { createError, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { pendingTeamTool } from './team-tools'
import type { KitchenAgentRequest, KitchenWorkspaceActionId } from './types'

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
          .filter((id): id is KitchenWorkspaceActionId =>
            workspaceActionIds.has(id as KitchenWorkspaceActionId)
          )
      )
    ),
  }
}
