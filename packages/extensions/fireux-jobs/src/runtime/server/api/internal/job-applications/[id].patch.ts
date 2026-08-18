import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { mutateJobApplication } from '../../../../job/server/operations/hiring/index.ts'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  return mutateJobApplication(event, getRouterParam(event, 'id'), body)
})
