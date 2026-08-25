import { createError, defineEventHandler, readBody } from 'h3'
import { useFireuxAi } from 'fireux-ai/runtime/server/utils/fireux-ai.server'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { requireKitchenWriter } from 'fireux-kitchens/runtime/kitchen/server/core/operator-access'
import { DishStorage, readDishItemKind } from 'fireux-kitchens/runtime/kitchen/utils/dish'

const NOTES_MAX_LENGTH = 1_200
const DESCRIPTION_MAX_LENGTH = 800
const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as Record<string, unknown> | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const drinkId = requirePathSegment(body?.drinkId, 'Drink id')
  const notes = text(body?.notes)
  if (!notes || notes.length > NOTES_MAX_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Drink notes must contain 1–${NOTES_MAX_LENGTH} characters.`,
    })
  }

  const access = await requireKitchenWriter(event, { appId, kitchenId })
  const snapshot = await access.db
    .collection(`kitchens/${kitchenId}/${DishStorage.collection}`)
    .doc(drinkId)
    .get()
  const drink = snapshot.data() || {}
  if (!snapshot.exists || readDishItemKind(drink.item_kind) !== 'drink') {
    throw createError({ statusCode: 404, statusMessage: 'Drink not found.' })
  }

  const response = await useFireuxAi(event).generateText({
    appId,
    task: 'rewrite_text',
    timeoutMs: 60_000,
    input: { text: notes, drink: { name: text(drink.name) || drinkId } },
    context: {
      agent: 'DrinksAI',
      instruction:
        'Write one concise hospitality menu description using only the supplied operator notes and Drink name. Do not add ingredients, flavours, provenance, alcohol content, allergens, serving claims, prices, or availability unless explicitly present in the notes. Return only the proposed description as plain text.',
    },
  })
  const proposal = text(response.text)
    .replace(/^['"]|['"]$/g, '')
    .slice(0, DESCRIPTION_MAX_LENGTH)
  if (!response.ok || !proposal) {
    throw createError({
      statusCode: response.disabled ? 503 : 502,
      statusMessage: response.reason || 'DrinksAI could not propose a description.',
    })
  }

  return { ok: true as const, proposal, source: response.execution }
})
