import { defineEventHandler, readBody } from 'h3'
import { createKitchenIngredient } from '../../../../../kitchen/server/ingredients/commands'
export default defineEventHandler(async (event) =>
  createKitchenIngredient(event, await readBody(event))
)
