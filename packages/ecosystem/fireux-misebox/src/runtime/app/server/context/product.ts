import { createHash } from 'node:crypto'
import { createError } from 'h3'
export function projectProductContext(value: unknown) {
  const data =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const field = (key: string, max: number) => {
    const value = data[key]
    if (typeof value !== 'string' || !value.trim() || value.length > max)
      throw createError({
        statusCode: 422,
        statusMessage: 'Product context needs review.',
      })
    return value
  }
  if (!['draft', 'reviewed'].includes(String(data.reviewStatus)))
    throw createError({
      statusCode: 422,
      statusMessage: 'Product context needs review.',
    })
  return {
    title: field('title', 120),
    summary: field('summary', 4000),
    source: field('source', 500),
    reviewStatus: data.reviewStatus as 'draft' | 'reviewed',
  }
}

export function sharedProductContext(
  data: Record<string, unknown>,
  ecosystemProjectId: string,
  projectId: string
) {
  const grant = data.fireuxSharing as Record<string, unknown> | undefined
  if (
    ecosystemProjectId !== projectId ||
    grant?.enabled !== true ||
    grant?.projectId !== projectId ||
    grant?.firebaseProjectId !== 'fireux-2005'
  )
    throw createError({
      statusCode: 403,
      statusMessage:
        'Misebox has not shared this context with the selected Project.',
    })
  const context = projectProductContext(data)
  return {
    appId: 'misebox-app',
    contextId: 'product',
    sourcePath: 'apps/misebox-app/context/product',
    revision: createHash('sha256')
      .update(JSON.stringify(context))
      .digest('hex'),
    context,
  }
}
