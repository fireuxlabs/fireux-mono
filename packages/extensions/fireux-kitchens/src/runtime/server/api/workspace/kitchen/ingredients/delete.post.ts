import { defineEventHandler, readBody } from 'h3'
import { deleteKitchenIngredient } from '../../../../../kitchen/server/ingredients/delete'
export default defineEventHandler(async (event) =>
  deleteKitchenIngredient(event, await readBody(event))
)
