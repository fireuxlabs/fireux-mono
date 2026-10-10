import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateIngredient } from '../../../../ingredient/server/update'

export default defineEventHandler(async (event) => ({
  ingredient: await updateIngredient(
    event,
    String(getRouterParam(event, 'id') || ''),
    await readBody(event)
  ),
}))
