// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: cursor-scan roots and emit only eligible safe DTOs.
import { FieldPath } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import {
  PUBLIC_JOB_INDEX_MAX_PAGE_SIZE,
  PUBLIC_JOB_INDEX_MAX_SCAN_SIZE,
  PUBLIC_JOB_INDEX_PAGE_SIZE,
  PUBLIC_JOB_INDEX_SCAN_BATCH_SIZE,
  type PublicJobIndexPage,
} from '../../../models/job-public.model.ts'
import {
  projectPublicJob,
  readPublicJobRuntimeScope,
} from '../../utils/job/public-projection.ts'

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

export default defineEventHandler(async (event): Promise<PublicJobIndexPage> => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })

  const scope = readPublicJobRuntimeScope(event)
  if (!scope.categories.size) return { items: [] }

  const query = getQuery(event)
  const limit = pageSize(query.limit)
  const requestedCursor = text(query.cursor)
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

    for (const [index, document] of snapshot.docs.entries()) {
      scanned += 1
      afterId = document.id
      const item = projectPublicJob(
        document.id,
        document.data() || {},
        scope
      )
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
})
