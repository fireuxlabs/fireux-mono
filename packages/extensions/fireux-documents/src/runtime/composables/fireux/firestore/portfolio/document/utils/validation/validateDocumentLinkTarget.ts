import type { DocumentLinkTargetType } from '../../../../../../../models/document-link.model'

const normalize = (value: unknown) => String(value || '').trim()

const allowedTargetTypes = new Set<DocumentLinkTargetType>([
  'portfolio',
  'property',
  'unit',
  'compliance-record',
  'tenancy',
  'task',
])

export type DocumentLinkValidationResult = {
  ok: boolean
  errors: string[]
  targetType: DocumentLinkTargetType | null
  targetId: string
}

export function validateDocumentLinkTarget(
  targetType: unknown,
  targetId: unknown
): DocumentLinkValidationResult {
  const errors: string[] = []
  const normalizedType = normalize(targetType)
  const normalizedId = normalize(targetId)

  const parsedType = allowedTargetTypes.has(normalizedType as DocumentLinkTargetType)
    ? (normalizedType as DocumentLinkTargetType)
    : null

  if (!parsedType) {
    errors.push(`Unsupported target type '${normalizedType || 'unset'}'.`)
  }

  if (!normalizedId) {
    errors.push('Target id is required.')
  }

  return {
    ok: errors.length === 0,
    errors,
    targetType: parsedType,
    targetId: normalizedId,
  }
}

export const documentLinkTargetTypes = Array.from(allowedTargetTypes)
