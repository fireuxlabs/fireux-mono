import { defineEventHandler, readBody } from 'h3'
import { deleteDish } from '../../../../../kitchen/server/dishes/delete'
export default defineEventHandler(async (event) =>
  deleteDish(event, await readBody(event))
)
