import { defineEventHandler, setResponseHeaders } from 'h3'
import type { PublicIngredientCollectionResponse } from '../../../../ingredient/models/ingredient-public.model.ts'
import { listIngredientsForCurator } from '../../../../ingredient/server/curation.ts'

export default defineEventHandler(
  async (event): Promise<PublicIngredientCollectionResponse> => {
    const items = await listIngredientsForCurator(event)
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    })
    return { items }
  }
)
