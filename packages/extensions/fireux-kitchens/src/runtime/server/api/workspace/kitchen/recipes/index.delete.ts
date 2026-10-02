import { defineEventHandler, readBody } from 'h3'
import { deleteRecipe } from '../../../../../kitchen/server/recipes/commands'
export default defineEventHandler(async event => deleteRecipe(event, await readBody(event)))
