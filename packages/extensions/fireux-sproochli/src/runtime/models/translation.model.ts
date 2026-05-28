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

export type TranslationStatus = 'draft' | 'review' | 'published' | 'archived'
export type TranslationDirection = 'ltr' | 'rtl'

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
