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
  const currentAbout = bounded(place.about, 900)
  const currentTags = Array.isArray(place.tags)
    ? place.tags
        .map((value) => bounded(value, 48).toLowerCase())
        .filter(Boolean)
        .slice(0, 8)
    : []
  if (
    currentShortName &&
    currentTagline &&
    currentAbout &&
    currentTags.length
  ) {
    return { id: actor.placeRef.id, generated: false }
  }

  const ai = useFireuxAi(event)
  const response = await ai.generateJson<{
    short_name?: unknown
    tagline?: unknown
    about?: unknown
    tags?: unknown
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
        'Suggest a concise recognizable short name, one restrained factual tagline, a short factual venue introduction, and up to five useful discovery tags. Use only the supplied facts. Tags must be reader-friendly categories supported by the supplied Google types or location, not generic provider types such as establishment, food, or point_of_interest. Do not invent cuisine, facilities, awards, ownership, quality claims, ratings, prices, or services. Return empty values when facts do not support them.',
    },
    outputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        short_name: { type: 'string', maxLength: 80 },
        tagline: { type: 'string', maxLength: 180 },
        about: { type: 'string', maxLength: 900 },
        tags: {
          type: 'array',
          maxItems: 5,
          items: { type: 'string', maxLength: 48 },
        },
      },
      required: ['short_name', 'tagline', 'about', 'tags'],
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
    ...(currentAbout || bounded(response.data?.about, 900)
      ? { about: currentAbout || bounded(response.data?.about, 900) }
      : {}),
    tags: currentTags.length
      ? currentTags
      : Array.isArray(response.data?.tags)
        ? Array.from(
            new Set(
              response.data.tags
                .map((value) => bounded(value, 48).toLowerCase())
                .filter(Boolean)
            )
          ).slice(0, 5)
        : [],
  }
})
