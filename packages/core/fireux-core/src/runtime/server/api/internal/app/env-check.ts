import { defineEventHandler, setHeader } from 'h3'
import { readAppEnvironmentCheck } from '../../../../app/server/onboarding/environment-check'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')
  return readAppEnvironmentCheck(event)
})
