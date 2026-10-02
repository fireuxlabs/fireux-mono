import { defineEventHandler, readBody } from 'h3'
import { updateRecipe } from '../../../../../kitchen/server/recipes/commands'
export default defineEventHandler(async event => updateRecipe(event, await readBody(event)))
