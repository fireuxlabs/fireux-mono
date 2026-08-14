import { defineEventHandler, readBody } from 'h3'
import { updateKitchenMenuConfig } from '../../../../kitchen/menu-config.ts'

export default defineEventHandler(async event =>
  updateKitchenMenuConfig(event, await readBody(event))
)
