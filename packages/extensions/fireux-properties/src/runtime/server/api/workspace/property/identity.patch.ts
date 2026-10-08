import { defineEventHandler, readBody } from 'h3'
import { updatePropertyIdentity } from '../../../../property/server/identity/update'
export default defineEventHandler(async (event) =>
  updatePropertyIdentity(event, await readBody(event))
)
