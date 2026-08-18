import { createError, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { pendingTeamTool } from './team-tools'
import type { KitchenAgentRequest } from './types'

const PROMPT_MAX_LENGTH = 2_000
const text = (value: unknown) => String(value ?? '').trim()

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
  return {
    appId: requirePathSegment(body?.appId, 'App id'),
    kitchenId: requirePathSegment(body?.kitchenId, 'Kitchen id'),
    prompt: readPrompt(body?.prompt),
    operation: text(body?.operation),
    pendingTool: pendingTeamTool(body?.pendingTool),
  }
}
