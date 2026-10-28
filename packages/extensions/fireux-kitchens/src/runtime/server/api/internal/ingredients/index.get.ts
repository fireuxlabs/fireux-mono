import { defineEventHandler, setResponseHeader, setResponseHeaders } from 'h3'

import type { IngredientDirectoryPage } from '../../../../ingredient/models/ingredient-directory.model.ts'
import { listIngredientsForCurator } from '../../../../ingredient/server/list-for-curator'

export default defineEventHandler(
  async (event): Promise<IngredientDirectoryPage> => {
    setResponseHeader(event, 'Cache-Control', 'no-store')

    const items = await listIngredientsForCurator(event)
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    return { items }
  }
)
