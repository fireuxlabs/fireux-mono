import { defineEventHandler, readBody } from 'h3'
import { updateKitchenSproochli } from '../../../kitchen/identity/sproochli.ts'

export default defineEventHandler(async (event) =>
  updateKitchenSproochli(event, await readBody(event))
)
