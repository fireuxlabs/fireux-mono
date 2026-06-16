import { createError } from 'h3'
import { readString } from '../records/read.ts'

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
