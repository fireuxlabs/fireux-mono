import { createError, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { isPurchasingAIHelloPrompt } from 'fireux-kitchens/runtime/kitchen/models/purchasing-ai'
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
  const prompt = readPrompt(body?.prompt)
  const operation = text(body?.operation)
  const purchasingHello =
    operation === 'purchasing' ||
    (!operation && isPurchasingAIHelloPrompt(prompt))

  return {
    appId: requirePathSegment(body?.appId, 'App id'),
    kitchenId: purchasingHello
      ? text(body?.kitchenId)
      : requirePathSegment(body?.kitchenId, 'Kitchen id'),
    prompt,
    operation,
    pendingTool: pendingTeamTool(body?.pendingTool),
  }
}
