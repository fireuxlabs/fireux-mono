import {
  defineEventHandler,
  setResponseHeader,
  createError,
  getRouterParam,
  setResponseHeaders,
} from 'h3'

import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { IngredientDetailResponse } from '../../../ingredient/models/ingredient-directory.model.ts'
import {
  normalizeIngredient,
  isActiveIngredient,
} from '../../../ingredient/server/normalize.ts'

export default defineEventHandler(
  async (event): Promise<IngredientDetailResponse> => {
    setResponseHeader(event, 'Cache-Control', 'no-store')

    const id = requireFirestoreDocumentId(
      getRouterParam(event, 'id'),
      'Ingredient id'
    )
    const snapshot = await getRuntimeFirestore().doc(`ingredients/${id}`).get()
    const ingredient = snapshot.exists ? normalizeIngredient(snapshot) : null
    if (!ingredient || !isActiveIngredient(snapshot.data())) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Ingredient not found.',
      })
    }

    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    return { ingredient }
  }
)
