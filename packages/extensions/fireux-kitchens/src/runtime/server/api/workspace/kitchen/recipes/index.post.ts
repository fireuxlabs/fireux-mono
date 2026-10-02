import { defineEventHandler, readBody } from 'h3'
import { createRecipe } from '../../../../../kitchen/server/recipes/commands'
export default defineEventHandler(async event => createRecipe(event, await readBody(event)))
