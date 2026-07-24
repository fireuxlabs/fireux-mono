import { defineEventHandler, readBody } from 'h3'
import { updateKitchenSproochli } from '../../../kitchen/sproochli.ts'

export default defineEventHandler(async event =>
  updateKitchenSproochli(event, await readBody(event))
)
