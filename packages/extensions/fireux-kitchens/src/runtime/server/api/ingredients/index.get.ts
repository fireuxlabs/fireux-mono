import { FieldPath } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { PublicIngredientCollectionResponse } from '../../../models/ingredient-public.model.ts'
import { projectPublicIngredient } from '../../ingredient/public-projection.ts'

const MAX_LIBRARY_SIZE = 500
const MAX_EXACT_IDS = 100
const text = (value: unknown) => String(value ?? '').trim()

const exactIds = (value: unknown) => {
  if (value === undefined || value === '') return []
  if (typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ingredient ids must be a comma-separated string.',
    })
  }
  const ids = [...new Set(value.split(',').map(text).filter(Boolean))]
  if (
    ids.length > MAX_EXACT_IDS
    || ids.some(id => !isFirestoreDocumentId(id))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: `Ingredient ids must contain at most ${MAX_EXACT_IDS} valid ids.`,
    })
  }
  return ids
}

export default defineEventHandler(
  async (event): Promise<PublicIngredientCollectionResponse> => {
    const db = getRuntimeFirestore()
    const ids = exactIds(getQuery(event).ids)
    const documents = ids.length
      ? await db.getAll(...ids.map(id => db.doc(`ingredients/${id}`)))
      : (
          await db
            .collection('ingredients')
            .orderBy(FieldPath.documentId())
            .limit(MAX_LIBRARY_SIZE + 1)
            .get()
        ).docs

    if (!ids.length && documents.length > MAX_LIBRARY_SIZE) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Ingredient library exceeds the bounded public projection.',
      })
    }

    const items = documents
      .filter(document => document.exists)
      .map(projectPublicIngredient)
      .filter(item => item?.status === 'active')
      .sort((left, right) =>
        (left?.name || '').localeCompare(right?.name || '', undefined, {
          sensitivity: 'base',
        })
      )

    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })
    return {
      items: items.filter(
        (item): item is NonNullable<typeof item> => Boolean(item)
      ),
    }
  }
)
