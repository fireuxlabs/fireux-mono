import { defineEventHandler, readBody } from 'h3'
import { interpretTestIntent } from 'fireux-ai/runtime/server/utils/test-intent'

export default defineEventHandler(async (event) =>
  interpretTestIntent(event, await readBody(event))
)
