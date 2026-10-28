// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: share the Firestore document-id boundary with browser code.

export function isFirestoreDocumentId(value: unknown): boolean {
  const segment = typeof value === 'string' ? value.trim() : ''
  return (
    Boolean(segment) &&
    segment !== '.' &&
    segment !== '..' &&
    !segment.includes('/') &&
    !(segment.startsWith('__') && segment.endsWith('__')) &&
    new TextEncoder().encode(segment).length <= 1_500
  )
}

