import type { H3Event } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { requireKitchenWriter } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { suggestKitchenTeamPrompts } from './team-tools'
import { readKitchenTeamToolMembers } from './team-records'

type KitchenAgentSuggestionRequest = {
  appId: string
  kitchenId: string
  operation: string
}

const suggestions = (value: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) =>
          String(item ?? '')
            .trim()
            .replace(/\s+/g, ' ')
        )
        .filter((item) => item && item.length <= 160)
    )
  ).slice(0, 4)

export async function runKitchenAgentSuggestions(
  event: H3Event,
  request: KitchenAgentSuggestionRequest
) {
  await requireKitchenWriter(event, request)
  if (request.operation !== 'team') {
    return { ok: true as const, suggestions: [] }
  }
  const members = await readKitchenTeamToolMembers(event, request)
  const result = await suggestKitchenTeamPrompts(
    useFireuxAi(event),
    request.appId,
    members
  )
  return {
    ok: true as const,
    suggestions: suggestions(result.ok ? result.data?.suggestions : []),
  }
}
