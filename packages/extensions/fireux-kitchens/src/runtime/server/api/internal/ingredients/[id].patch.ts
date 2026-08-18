import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateIngredient } from '../../../../ingredient/server/curation.ts'

export default defineEventHandler(async (event) => ({
  item: await updateIngredient(
    event,
    String(getRouterParam(event, 'id') || ''),
    await readBody(event)
  ),
}))
