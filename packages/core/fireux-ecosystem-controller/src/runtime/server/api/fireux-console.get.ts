import { useRuntimeConfig } from '#imports'
import {
  buildFireuxEcosystemConsoleResponse,
} from '../utils/fireux-console'
import { createError, defineEventHandler, setResponseHeaders } from 'h3'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = runtimeConfig.public as {
    firebaseEcosystem?: {
      firebase?: {
        projectId?: string
      }
    }
  }
  const firebaseProjectId = String(
    publicConfig.firebaseEcosystem?.firebase?.projectId || ''
  ).trim()

  if (!firebaseProjectId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase project id',
    })
  }

  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return buildFireuxEcosystemConsoleResponse(firebaseProjectId)
})
