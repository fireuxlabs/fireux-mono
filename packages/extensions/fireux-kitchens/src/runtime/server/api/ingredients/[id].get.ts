import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { PublicIngredientDetailResponse } from '../../../models/ingredient-public.model.ts'
import { projectPublicIngredient } from '../../ingredient/public-projection.ts'

export default defineEventHandler(
  async (event): Promise<PublicIngredientDetailResponse> => {
    const id = requireFirestoreDocumentId(
      getRouterParam(event, 'id'),
      'Ingredient id'
    )
    const snapshot = await getRuntimeFirestore().doc(`ingredients/${id}`).get()
    const item = snapshot.exists ? projectPublicIngredient(snapshot) : null
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Ingredient not found.' })
    }

    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })
    return { item }
  }
)
