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
