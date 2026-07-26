import { defineEventHandler, getQuery } from 'h3'
import { listJobApplications } from '../../job/hiring.ts'

export default defineEventHandler(event => {
  const query = getQuery(event)
  return listJobApplications(event, query.scope)
})
