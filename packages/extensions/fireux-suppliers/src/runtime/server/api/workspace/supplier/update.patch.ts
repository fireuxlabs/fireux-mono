import { defineEventHandler, readBody } from 'h3'
import { updateSupplier } from '../../../../supplier/server/identity/update.ts'

export default defineEventHandler(async (event) =>
  updateSupplier(event, await readBody(event))
)
