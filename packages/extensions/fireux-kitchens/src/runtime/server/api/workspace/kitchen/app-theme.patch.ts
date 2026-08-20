import { defineEventHandler, readBody } from 'h3'
import { updateKitchenAppTheme } from '../../../../kitchen/server/identity/app-theme.ts'

export default defineEventHandler(async (event) =>
  updateKitchenAppTheme(event, await readBody(event))
)
