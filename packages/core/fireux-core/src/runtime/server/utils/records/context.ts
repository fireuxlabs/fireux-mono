import { createError } from 'h3'

/** Shared text contract only; callers retain record selection and authority. */
export function readContextRequest(
  input: unknown,
  identityFields: string[],
  write: boolean
) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid context request.',
    })
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) =>
        ![
          ...identityFields,
          ...(write ? ['context', 'previous'] : []),
        ].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported context field.',
    })
  if (
    write &&
    (typeof value.context !== 'string' ||
      value.context.length > 32000 ||
      typeof value.previous !== 'string')
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Context must be text up to 32,000 characters.',
    })
  return value
}

export function contextChange(value: Record<string, unknown>, current: string) {
  if (value.previous !== current)
    throw createError({
      statusCode: 409,
      statusMessage:
        'Context changed elsewhere. Reload it before editing again.',
    })
  return (value.context as string).trim()
}
