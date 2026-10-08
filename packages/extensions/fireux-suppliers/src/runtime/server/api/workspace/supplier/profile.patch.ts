import { defineEventHandler, readBody } from 'h3'
import { updateSupplierProfile } from '../../../../supplier/server/identity/profile'
export default defineEventHandler(async (event) =>
  updateSupplierProfile(event, await readBody(event))
)
