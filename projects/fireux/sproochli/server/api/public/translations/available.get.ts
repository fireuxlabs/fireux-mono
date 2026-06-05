import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  TranslationDocumentStorage,
  TranslationStorage,
} from 'fireux-sproochli/runtime/models/translation.model.ts'

type PublishedTranslation = {
  code: string
  label: string
  native_label: string
  direction: 'ltr' | 'rtl'
}

type TranslationDocData = {
  source_language?: string
}

type TranslationData = Partial<PublishedTranslation> & {
  status?: string
}

function queryString(value: unknown): string {
  if (Array.isArray(value)) return queryString(value[0])
  return typeof value === 'string' ? value.trim() : ''
}

function documentKey(sourceApp: string, documentType: string, documentSlug: string) {
  return `${sourceApp}_${documentType}_${documentSlug}`.replace(/[^A-Za-z0-9_-]/g, '_')
}

function normalizeTranslation(code: string, data: TranslationData): PublishedTranslation | null {
  if (data.status !== 'published') return null

  return {
    code,
    label: String(data.label || code),
    native_label: String(data.native_label || data.label || code),
    direction: data.direction === 'rtl' ? 'rtl' : 'ltr',
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=60, s-maxage=300',
  })

  const query = getQuery(event)
  const sourceApp = queryString(query.source_app)
  const documentType = queryString(query.document_type)
  const documentSlug = queryString(query.document_slug)

  if (!sourceApp || !documentType || !documentSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'source_app, document_type and document_slug are required',
    })
  }

  const db = getRuntimeFirestore('sproochli')
  const docRef = db.collection(TranslationDocumentStorage.collection).doc(
    documentKey(sourceApp, documentType, documentSlug)
  )
  const docSnap = await docRef.get()
  const docData = (docSnap.exists ? docSnap.data() : {}) as TranslationDocData
  const translationsSnap = docSnap.exists
    ? await docRef.collection(TranslationStorage.collection).get()
    : null

  const availableLanguages = translationsSnap
    ? translationsSnap.docs
        .map((translationDoc) =>
          normalizeTranslation(translationDoc.id, translationDoc.data() as TranslationData)
        )
        .filter((translation): translation is PublishedTranslation => Boolean(translation))
        .sort((a, b) => a.code.localeCompare(b.code))
    : []

  return {
    source_app: sourceApp,
    document_type: documentType,
    document_slug: documentSlug,
    source_language: docData.source_language ?? '',
    available_languages: availableLanguages,
    translations_ready: availableLanguages.length > 0,
  }
})
