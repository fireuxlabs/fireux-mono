import { FieldPath } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { CompanyStorage } from 'fireux-companies/runtime/models/company.model'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import {
  PUBLIC_JOB_INDEX_MAX_PAGE_SIZE,
  PUBLIC_JOB_INDEX_MAX_SCAN_SIZE,
  PUBLIC_JOB_INDEX_PAGE_SIZE,
  PUBLIC_JOB_INDEX_SCAN_BATCH_SIZE,
  type PublicJobIndexPage,
} from '../../models/job-public.model.ts'
import {
  isPublicJobCandidate,
  projectPublicJob,
  readPublicJobRuntimeScope,
} from '../utils/job/public-projection.ts'

const text = (value: unknown) => String(value ?? '').trim()

const pageSize = (value: unknown) => {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, PUBLIC_JOB_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_JOB_INDEX_PAGE_SIZE
}

const encodeCursor = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64url')

const decodeCursor = (value: unknown) => {
  const cursor = text(value)
  if (!cursor || !/^[A-Za-z0-9_-]+$/.test(cursor)) return ''

  try {
    const id = Buffer.from(cursor, 'base64url').toString('utf8')
    return isFirestoreDocumentId(id) && encodeCursor(id) === cursor ? id : ''
  } catch {
    return ''
  }
}

/**
 * Canonical bounded Job directory reader shared by JSON and sitemap transport.
 * No caller may discover Job ids through a weaker visibility-only query.
 */
export async function readPublicJobIndexPage(
  event: H3Event,
  input: { cursor?: unknown; limit?: unknown } = {}
): Promise<PublicJobIndexPage> {
  const scope = readPublicJobRuntimeScope(event)
  if (scope.categoryScope === 'allowlist' && !scope.categories.size) {
    return { items: [] }
  }

  const limit = pageSize(input.limit)
  const requestedCursor = text(input.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job cursor is invalid.',
    })
  }

  const db = getRuntimeFirestore()
  const items: PublicJobIndexPage['items'] = []
  let afterId = cursor
  let scanned = 0
  let nextCursor = ''
  let exhausted = false

  while (
    items.length < limit &&
    scanned < PUBLIC_JOB_INDEX_MAX_SCAN_SIZE &&
    !exhausted
  ) {
    const scanLimit = Math.min(
      PUBLIC_JOB_INDEX_SCAN_BATCH_SIZE,
      PUBLIC_JOB_INDEX_MAX_SCAN_SIZE - scanned
    )
    let jobsQuery = db
      .collection('jobs')
      .orderBy(FieldPath.documentId())
      .limit(scanLimit)
    if (afterId) jobsQuery = jobsQuery.startAfter(afterId)

    const snapshot = await jobsQuery.get().catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Job directory could not be read.',
      })
    })
    if (snapshot.empty) {
      exhausted = true
      break
    }

    const candidates = snapshot.docs.filter((document) =>
      isPublicJobCandidate(document.id, document.data() || {}, scope)
    )
    const companyIds = Array.from(
      new Set(
        candidates
          .map((document) => text(document.data()?.company_id))
          .filter(isFirestoreDocumentId)
      )
    )
    const placeIds = Array.from(
      new Set([
        ...companyIds,
        ...candidates
          .map((document) => text(document.data()?.place_id))
          .filter(isFirestoreDocumentId),
      ])
    )
    const [companies, places] = await Promise.all([
      companyIds.length
        ? db.getAll(
            ...companyIds.map((id) =>
              db.collection(CompanyStorage.collection).doc(id)
            )
          )
        : Promise.resolve([]),
      placeIds.length
        ? db.getAll(
            ...placeIds.map((id) =>
              db.collection(PlaceStorage.collection).doc(id)
            )
          )
        : Promise.resolve([]),
    ]).catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Job directory relationships could not be read.',
      })
    })
    const companiesById = new Map(
      companies.map((document) => [document.id, document])
    )
    const placesById = new Map(
      places.map((document) => [document.id, document])
    )

    for (const [index, document] of snapshot.docs.entries()) {
      scanned += 1
      afterId = document.id
      const data = document.data() || {}
      const companyId = text(data.company_id)
      const placeId = text(data.place_id)
      let item: PublicJobIndexPage['items'][number] | null = null
      try {
        item = projectPublicJob(document.id, data, scope, {
          company: companiesById.get(companyId)?.data() || {},
          companyPlace: placesById.get(companyId)?.data() || {},
          place: placesById.get(placeId)?.data() || {},
        })
      } catch {
        throw createError({
          statusCode: 503,
          statusMessage: 'The Job directory contains an invalid published Job.',
        })
      }
      if (item) items.push(item)

      if (items.length >= limit) {
        const unprocessedInBatch = index < snapshot.docs.length - 1
        if (unprocessedInBatch || snapshot.docs.length === scanLimit) {
          nextCursor = encodeCursor(afterId)
        } else {
          nextCursor = ''
          exhausted = true
        }
        break
      }
    }

    if (items.length >= limit) break
    if (snapshot.docs.length < scanLimit) {
      exhausted = true
    } else {
      nextCursor = encodeCursor(afterId)
    }
  }

  return {
    items,
    ...(!exhausted && nextCursor ? { nextCursor } : {}),
  }
}
