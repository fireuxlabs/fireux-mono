import { createError, type H3Event } from 'h3'
import { GoogleAuth } from 'google-auth-library'
import { requireProjectOperator } from '../core/authority'

const MISEBOX_CONTEXT_URL = 'https://misebox.app/api/fireux/context/product'
const auth = new GoogleAuth()

export function projectSharedContext(value: unknown) {
  const data =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const context =
    data.context && typeof data.context === 'object'
      ? (data.context as Record<string, unknown>)
      : {}
  const field = (key: string, max: number) => {
    const value = context[key]
    if (typeof value !== 'string' || !value.trim() || value.length > max)
      throw createError({
        statusCode: 502,
        statusMessage: 'Misebox returned invalid context.',
      })
    return value
  }
  if (
    data.appId !== 'misebox-app' ||
    data.contextId !== 'product' ||
    data.sourcePath !== 'apps/misebox-app/context/product' ||
    typeof data.revision !== 'string' ||
    !/^[a-f0-9]{64}$/.test(data.revision) ||
    !['draft', 'reviewed'].includes(String(context.reviewStatus))
  )
    throw createError({
      statusCode: 502,
      statusMessage: 'Misebox returned invalid context.',
    })
  return {
    appId: 'misebox-app',
    contextId: 'product',
    sourcePath: data.sourcePath,
    revision: data.revision,
    context: {
      title: field('title', 120),
      summary: field('summary', 4000),
      source: field('source', 500),
      reviewStatus: context.reviewStatus as 'draft' | 'reviewed',
    },
  }
}

export async function readProjectAppContext(event: H3Event, id: unknown) {
  const { projectId } = await requireProjectOperator(event, id)
  let token: string
  try {
    const client = await auth.getIdTokenClient(MISEBOX_CONTEXT_URL)
    token = await client.idTokenProvider.fetchIdToken(MISEBOX_CONTEXT_URL)
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage:
        'FireUX service identity is unavailable in this environment.',
    })
  }
  let response: unknown
  try {
    response = await $fetch(MISEBOX_CONTEXT_URL, {
      query: { projectId },
      headers: { 'x-fireux-service-token': token },
      timeout: 15000,
      retry: 0,
      redirect: 'error',
    })
  } catch (cause) {
    const failure = cause as {
      statusCode?: number
      data?: { statusMessage?: string }
    }
    const status = failure?.statusCode
    const serviceDenied =
      status === 401 ||
      (status === 403 &&
        failure.data?.statusMessage ===
          'This service cannot read Misebox context.')
    throw createError({
      statusCode: serviceDenied
        ? 503
        : status === 403 || status === 404
          ? status
          : 502,
      statusMessage: serviceDenied
        ? 'This environment is not authorized to use the Misebox context service.'
        : status === 403
          ? 'Misebox denied access to this context.'
          : status === 404
            ? 'No shared Misebox context is available for this Project.'
            : 'Misebox context service is unavailable.',
    })
  }
  return projectSharedContext(response)
}
