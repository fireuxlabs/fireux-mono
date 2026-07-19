import { createError } from 'h3'
import { readString } from '../records/read.ts'

export function isFirestoreDocumentId(value: unknown): boolean {
  const segment = readString(value)
  return (
    Boolean(segment) &&
    segment !== '.' &&
    segment !== '..' &&
    !segment.includes('/') &&
    !(segment.startsWith('__') && segment.endsWith('__')) &&
    new TextEncoder().encode(segment).length <= 1_500
  )
}

export function requireFirestoreDocumentId(value: unknown, label: string) {
  const segment = readString(value)

  if (!segment) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is required.`,
    })
  }

  if (!isFirestoreDocumentId(segment)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is invalid.`,
    })
  }

  return segment
}

export function requirePathSegment(value: unknown, label: string) {
  const segment = readString(value)

  if (!segment || segment.includes('/')) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} is required.`,
    })
  }

  return segment
}
