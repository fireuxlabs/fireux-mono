import { defineEventHandler, readBody } from 'h3'
import { interpretKitchenTest } from '../../../../../kitchen/server/test/intent'
export default defineEventHandler(async (event) =>
  interpretKitchenTest(event, await readBody(event))
)
