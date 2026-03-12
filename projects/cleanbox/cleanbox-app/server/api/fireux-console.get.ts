import {
  defineEventHandler,
  getRequestHeader,
  getRequestURL,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { buildFireuxConsoleResponse } from 'fireux-core/runtime/server/utils/fireux-console.ts'

function getSiteUrl(event: H3Event) {
  const requestUrl = getRequestURL(event)
  const host = String(
    getRequestHeader(event, 'x-forwarded-host') ||
      getRequestHeader(event, 'host') ||
      requestUrl.host
  )
    .split(',')[0]
    .trim()
  const protocol = String(
    getRequestHeader(event, 'x-forwarded-proto') || requestUrl.protocol || 'https'
  )
    .replace(/:$/, '')
    .trim()

  return `${protocol}://${host}`
}

export default defineEventHandler((event) => {
  const cfg = useFireUXConfig()
  const runtimeConfig = useRuntimeConfig()

  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return buildFireuxConsoleResponse({
    appId: cfg.appId,
    appName: cfg.appName,
    description:
      'Operating system for cleaning operations, teams, and service workflows.',
    ecosystemId: cfg.ecosystem,
    firebaseProjectId: String(
      runtimeConfig.public?.firebaseEcosystem?.firebase?.projectId || ''
    ).trim(),
    projectType: 'ecosystem-app',
    siteUrl: getSiteUrl(event),
  })
})
