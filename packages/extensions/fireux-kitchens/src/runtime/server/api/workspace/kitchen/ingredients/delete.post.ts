import { defineEventHandler, readBody } from 'h3'
import { deleteKitchenIngredient } from '../../../../../kitchen/server/ingredients/commands'
export default defineEventHandler(async (event) =>
  deleteKitchenIngredient(event, await readBody(event))
)
