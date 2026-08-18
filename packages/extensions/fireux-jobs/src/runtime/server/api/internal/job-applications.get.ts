import { defineEventHandler, getQuery } from 'h3'
import { listJobApplications } from '../../../job/server/operations/hiring/index.ts'

export default defineEventHandler(event => {
  const query = getQuery(event)
  return listJobApplications(event, query.scope)
})
