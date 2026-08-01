/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Sproochli translation document
 * Storage: root translation document with scoped language translations
 * Root path: /translation_documents/<translationDocumentId>
 * Child path: /translation_documents/<translationDocumentId>/translations/<languageCode>
 */
export const TranslationDocumentStorage = {
  shape: 'root',
  path: 'translation_documents/{translationDocumentId}',
  collection: 'translation_documents',
  idParam: 'translationDocumentId',
  children: {
    translations:
      'translation_documents/{translationDocumentId}/translations/{languageCode}',
  },
} as const

export const TranslationStorage = {
  shape: 'scoped',
  path: 'translation_documents/{translationDocumentId}/translations/{languageCode}',
  collection: 'translations',
  parent: 'translation_document',
  idParam: 'languageCode',
} as const

/**
 * Server-owned provider cache.
 *
 * This is deliberately separate from TranslationDocumentStorage: translation
 * memory is reusable, unreviewed machine output, while translation documents
 * are the authored/reviewable publication family.
 */
export const TranslationMemoryStorage = {
  shape: 'root',
  path: 'translation_memory/{cacheId}',
  collection: 'translation_memory',
  idParam: 'cacheId',
  access: 'server-only',
} as const

export type TranslationStatus = 'draft' | 'review' | 'published' | 'archived'
export type TranslationDirection = 'ltr' | 'rtl'
export type TranslationMemoryReviewStatus = 'unreviewed'
export type TranslationMemoryProvenanceKind =
  | 'ai'
  | 'machine_translation'
  | 'source_document_extraction'
export type TranslationMemoryRecorder =
  | 'sproochli-menu-translate'
  | 'sproochli-menu-cache-import'

export type TranslationMemoryRecord = {
  id: string
  cache_version: string
  domain: string
  field_kind: string
  field_id: string
  source_language: string
  source_text: string
  source_hash: string
  target_language: string
  translated_text: string
  glossary_version: string
  provider: string
  review_status: TranslationMemoryReviewStatus
  provenance: {
    kind: TranslationMemoryProvenanceKind
    provider: string
    generated_by: TranslationMemoryRecorder
    source_app_id?: string
    source_document_id?: string
    source_model?: string
    generated_at?: unknown
  }
  updated_at?: unknown
}

export const TranslationDocumentModel = {
  id: '',
  source_app: '',
  document_type: '',
  document_slug: '',
  source_language: '',
  status: 'draft' as TranslationStatus,
  title: '',
} as const

export const TranslationModel = {
  id: '',
  language_code: '',
  label: '',
  native_label: '',
  direction: 'ltr' as TranslationDirection,
  status: 'draft' as TranslationStatus,
  source_text: '',
  translated_text: '',
} as const

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { [K in keyof T]: WidenLiteral<T[K]> }
  : T

export type TranslationDocument = WidenLiteral<typeof TranslationDocumentModel>
export type Translation = WidenLiteral<typeof TranslationModel>

export type TranslationDocumentCreateInput = Omit<TranslationDocument, 'id'>
export type TranslationDocumentUpdateInput = Partial<
  Omit<TranslationDocument, 'id'>
>
export type TranslationCreateInput = Omit<Translation, 'id'>
export type TranslationUpdateInput = Partial<
  Omit<Translation, 'id' | 'language_code'>
>
