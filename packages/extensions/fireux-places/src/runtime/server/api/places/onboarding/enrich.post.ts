import { defineEventHandler, readBody } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import {
  canConfigure,
  context,
} from '../../../../place/server/index/onboarding/context'
import {
  requestRecord,
  text,
} from '../../../../place/server/index/onboarding/input'
import { fetchVerifiedGooglePlacePayload } from '../../../../place/server/integration/google/details'

const bounded = (value: unknown, max: number) => {
  const candidate = text(value).replace(/\s+/g, ' ')
  return candidate && candidate.length <= max ? candidate : ''
}

export default defineEventHandler(async (event) => {
  const body = requestRecord(await readBody(event))
  const actor = await context(event, body.id)
  const snapshot = await actor.placeRef.get()
  const place = snapshot.exists
    ? snapshot.data() || {}
    : await fetchVerifiedGooglePlacePayload(event, actor.placeRef.id)

  if (snapshot.exists && !canConfigure(place, actor)) {
    return { id: actor.placeRef.id, generated: false }
  }

  const currentShortName = bounded(place.short_name, 80)
  const currentTagline = bounded(place.tagline, 180)
  if (currentShortName && currentTagline) {
    return { id: actor.placeRef.id, generated: false }
  }

  const ai = useFireuxAi(event)
  const response = await ai.generateJson<{
    short_name?: unknown
    tagline?: unknown
  }>({
    appId: actor.runtimeAppId,
    task: 'extract_structured_data',
    input: {
      name: bounded(place.name, 240),
      address: bounded(place.formatted_address, 500),
      town: bounded(
        (place.address as Record<string, unknown> | undefined)?.city,
        120
      ),
      types: Array.isArray(place.types) ? place.types.slice(0, 12) : [],
      website: bounded(place.website, 2_048),
    },
    context: {
      instruction:
        'Suggest a concise recognizable short name and one restrained factual tagline. Use only the supplied facts. Do not invent cuisine, awards, ownership, quality claims, or services. Return empty strings when the facts do not support useful copy.',
    },
    outputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        short_name: { type: 'string', maxLength: 80 },
        tagline: { type: 'string', maxLength: 180 },
      },
      required: ['short_name', 'tagline'],
    },
  })

  return {
    id: actor.placeRef.id,
    generated: response.ok === true,
    ...(currentShortName || bounded(response.data?.short_name, 80)
      ? {
          short_name:
            currentShortName || bounded(response.data?.short_name, 80),
        }
      : {}),
    ...(currentTagline || bounded(response.data?.tagline, 180)
      ? { tagline: currentTagline || bounded(response.data?.tagline, 180) }
      : {}),
  }
})
