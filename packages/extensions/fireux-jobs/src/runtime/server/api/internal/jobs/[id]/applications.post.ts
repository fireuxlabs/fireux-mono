import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { createJobApplication } from '../../../../job/hiring.ts'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  return createJobApplication(event, getRouterParam(event, 'id'), body)
})
