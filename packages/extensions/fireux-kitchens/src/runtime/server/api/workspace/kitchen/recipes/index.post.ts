import { defineEventHandler, readBody } from 'h3'
import { createRecipe } from '../../../../../kitchen/server/recipes/create'
export default defineEventHandler(async event => createRecipe(event, await readBody(event)))
