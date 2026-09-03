import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { deleteKitchenTest } from '../../../../../kitchen/server/test/commands.ts'
export default defineEventHandler(async (event) =>
  deleteKitchenTest(event, {
    ...(await readBody(event)),
    testId: getRouterParam(event, 'testId'),
  })
)
