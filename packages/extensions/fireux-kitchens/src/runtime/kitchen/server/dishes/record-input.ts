import { createError } from 'h3'

export function dishFields(input: unknown, allowed: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({ statusCode: 400, statusMessage: 'Invalid Dish input.' })
  const value = input as Record<string, unknown>
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Dish field. Use the image upload for media.',
    })
  return value
}

export function dishText(value: unknown, required = false): string {
  if (typeof value !== 'string')
    throw createError({
      statusCode: 400,
      statusMessage: 'Dish text fields must be strings.',
    })
  const result = value.trim()
  if (required && !result)
    throw createError({ statusCode: 400, statusMessage: 'Enter a Dish name.' })
  return result
}

export function validateDishInput<T>(read: () => T): T {
  try {
    return read()
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : 'Invalid Dish input.',
    })
  }
}
