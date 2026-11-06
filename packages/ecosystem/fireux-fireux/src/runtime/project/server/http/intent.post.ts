import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { interpretProject } from '../intent'
import { interpretProjectLanding } from '../landing-intent'
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const body = await readBody(event)
  return body?.capability === 'landing'
    ? interpretProjectLanding(event, body)
    : interpretProject(event, body)
})
