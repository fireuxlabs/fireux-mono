import { defineEventHandler, readBody } from 'h3'
import { createIngredient } from '../../../../ingredient/server/curation.ts'

export default defineEventHandler(async (event) => ({
  item: await createIngredient(event, await readBody(event)),
}))
