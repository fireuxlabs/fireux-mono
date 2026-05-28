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
