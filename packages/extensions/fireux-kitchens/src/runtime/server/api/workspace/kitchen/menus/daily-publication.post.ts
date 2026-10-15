import { defineEventHandler, readBody } from 'h3'
import { publishDailyMenu } from '../../../../../menu/server/publication/daily'
export default defineEventHandler(async (event) =>
  publishDailyMenu(event, await readBody(event))
)
