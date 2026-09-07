import { defineEventHandler, readBody } from 'h3'
import { createSupplierTeamMember } from '../../../../../supplier/server/team/create.ts'

export default defineEventHandler(async (event) =>
  createSupplierTeamMember(event, await readBody(event))
)
