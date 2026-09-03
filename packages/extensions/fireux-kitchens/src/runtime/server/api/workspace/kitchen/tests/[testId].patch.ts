import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { updateKitchenTest } from '../../../../../kitchen/server/test/commands.ts'
export default defineEventHandler(async (event) =>
  updateKitchenTest(event, {
    ...(await readBody(event)),
    testId: getRouterParam(event, 'testId'),
  })
)
