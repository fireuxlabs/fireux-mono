import { createError, type H3Event } from 'h3'
import { requireProjectOperator } from '../core/authority'
const MISEBOX_CONTEXT_URL = import.meta.dev
  ? 'http://localhost:3001/api/fireux/context/product'
  : 'https://misebox.app/api/fireux/context/product'

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
    data.schemaVersion !== 1 ||
    data.visibility !== 'public' ||
    data.sourcePath !== '/api/fireux/context/product' ||
    typeof data.revision !== 'string' ||
    !/^[a-f0-9]{64}$/.test(data.revision) ||
    context.reviewStatus !== 'reviewed'
  )
    throw createError({
      statusCode: 502,
      statusMessage: 'Misebox returned invalid context.',
    })
  return {
    schemaVersion: 1,
    visibility: 'public',
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
  if (projectId !== 'misebox')
    throw createError({
      statusCode: 404,
      statusMessage:
        'No public App context endpoint is configured for this Project.',
    })
  let response: unknown
  try {
    response = await $fetch(MISEBOX_CONTEXT_URL, {
      timeout: 15000,
      retry: 0,
      redirect: 'error',
    })
  } catch (cause) {
    const status = (cause as { statusCode?: number })?.statusCode
    throw createError({
      statusCode: status === 404 ? 404 : 502,
      statusMessage:
        status === 404
          ? 'Misebox has no published product context.'
          : 'Misebox public context service is unavailable.',
    })
  }
  return projectSharedContext(response)
}
