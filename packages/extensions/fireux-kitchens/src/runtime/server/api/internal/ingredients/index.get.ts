import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { setResponseHeaders } from 'h3'
import type { IngredientDirectoryPage } from '../../../../ingredient/models/ingredient-directory.model.ts'
import { listIngredientsForCurator } from '../../../../ingredient/server/curation.ts'

export default defineLiveReadHandler(
  async (event): Promise<IngredientDirectoryPage> => {
    const items = await listIngredientsForCurator(event)
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    })
    return { items }
  }
)
