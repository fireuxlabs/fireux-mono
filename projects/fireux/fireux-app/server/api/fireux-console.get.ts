import {
  createError,
  defineEventHandler,
  setResponseHeaders,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { buildFireuxConsoleResponse } from 'fireux-core/runtime/server/utils/fireux-console.ts'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const firebaseProjectId = String(
    runtimeConfig.public?.firebaseEcosystem?.firebase?.projectId || ''
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

  return buildFireuxConsoleResponse(firebaseProjectId)
})
