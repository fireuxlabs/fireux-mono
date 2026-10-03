import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { mutateJobEngagement } from '../../../../job/server/hiring/index.ts'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  return mutateJobEngagement(event, getRouterParam(event, 'id'), body)
})
