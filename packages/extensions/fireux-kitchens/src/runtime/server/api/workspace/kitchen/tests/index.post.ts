import { defineEventHandler, readBody } from 'h3'
import { createKitchenTest } from '../../../../../kitchen/server/test/commands.ts'
export default defineEventHandler(async (event) =>
  createKitchenTest(event, await readBody(event))
)
