import { defineEventHandler, readBody } from 'h3'
import { createKitchenIngredient } from '../../../../../kitchen/server/ingredients/create'
export default defineEventHandler(async (event) =>
  createKitchenIngredient(event, await readBody(event))
)
