import { defineEventHandler, readBody } from 'h3'
import { updateDish } from '../../../../../kitchen/server/dishes/update'
export default defineEventHandler(async (event) =>
  updateDish(event, await readBody(event))
)
