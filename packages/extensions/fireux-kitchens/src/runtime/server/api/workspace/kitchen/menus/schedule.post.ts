import { defineEventHandler, readBody } from 'h3'
import { configureDailyMenu } from '../../../../../menu/server/daily-menu'
export default defineEventHandler(async (event) =>
  configureDailyMenu(event, await readBody(event))
)
