import {
  getRequestHeader,
  getRequestURL,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'

type BuildProjectMetaInput = {
  description: string
}

function toSlug(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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

export function buildProjectMetaResponse(
  event: H3Event,
  input: BuildProjectMetaInput
) {
  const cfg = useFireUXConfig()
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = getSiteUrl(event)
  const firebaseProjectId = String(
    runtimeConfig.public?.firebaseEcosystem?.firebase?.projectId || ''
  ).trim()
  const name = String(cfg.appName || '').trim()
  const description = String(input.description || '').trim()

  setResponseHeaders(event, {
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return {
    ok: true,
    projectMeta: {
      appId: cfg.appId,
      appName: cfg.appName,
      ecosystem: cfg.ecosystem,
      firebaseProjectId,
      sourceUrl: siteUrl,
      name,
      description,
      slug: toSlug(name),
    },
  }
}
