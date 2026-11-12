import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'

export function readItemReferenceIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is string =>
              typeof id === 'string' && isFirestoreDocumentId(id)
          )
        ),
      ]
    : []
}
export function validateItemReferenceIds(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length > 50 ||
    value.some((id) => typeof id !== 'string' || !isFirestoreDocumentId(id))
  )
    throw new Error('Choose up to 50 valid Kitchen records.')
  return [...new Set(value)]
}
