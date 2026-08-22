import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { IngredientDetailResponse } from '../../../ingredient/models/ingredient-directory.model.ts'
import { normalizeIngredient } from '../../../ingredient/server/normalize.ts'

export default defineEventHandler(
  async (event): Promise<IngredientDetailResponse> => {
    const id = requireFirestoreDocumentId(
      getRouterParam(event, 'id'),
      'Ingredient id'
    )
    const snapshot = await getRuntimeFirestore().doc(`ingredients/${id}`).get()
    const ingredient = snapshot.exists ? normalizeIngredient(snapshot) : null
    if (!ingredient || ingredient.status !== 'active') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ingredient not found.',
      })
    }

    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })
    return { ingredient }
  }
)
