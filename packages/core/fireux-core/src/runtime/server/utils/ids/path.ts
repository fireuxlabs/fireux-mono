// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: reuse the browser-safe Firestore document-id predicate.
import { createError } from 'h3'
import { isFirestoreDocumentId } from '../../../utils/firestore-document-id'
import { readString } from '../records/read.ts'

export { isFirestoreDocumentId }

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
