import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { FieldPath } from 'firebase-admin/firestore'
import { createError, getQuery, setResponseHeaders } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  BLOG_DIRECTORY_MAX_PAGE_SIZE,
  BLOG_DIRECTORY_MAX_SCAN_SIZE,
  BLOG_DIRECTORY_PAGE_SIZE,
  BLOG_DIRECTORY_SCAN_BATCH_SIZE,
  type BlogDirectoryPage,
} from '../../../models/blog-directory.model.ts'
import {
  projectBlogDirectoryEntry,
  readBlogRuntimeScope,
} from '../../blog/read.ts'

const clean = (value: unknown) => String(value ?? '').trim()
const encodeCursor = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64url')
const decodeCursor = (value: unknown) => {
  const cursor = clean(value)
  if (!cursor || !/^[A-Za-z0-9_-]+$/.test(cursor)) return ''
  try {
    const id = Buffer.from(cursor, 'base64url').toString('utf8')
    return isFirestoreDocumentId(id) && encodeCursor(id) === cursor ? id : ''
  } catch {
    return ''
  }
}

export default defineLiveReadHandler(
  async (event): Promise<BlogDirectoryPage> => {
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })
    const scope = readBlogRuntimeScope(event)
    if (!scope) return { items: [] }

    const query = getQuery(event)
    const requestedLimit = Number(query.limit)
    const limit =
      Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, BLOG_DIRECTORY_MAX_PAGE_SIZE)
        : BLOG_DIRECTORY_PAGE_SIZE
    const requestedCursor = clean(query.cursor)
    const cursor = decodeCursor(requestedCursor)
    if (requestedCursor && !cursor) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Blog cursor is invalid.',
      })
    }

    const db = getRuntimeFirestore()
    const items: BlogDirectoryPage['items'] = []
    let afterId = cursor
    let scanned = 0
    let exhausted = false
    while (
      items.length < limit &&
      scanned < BLOG_DIRECTORY_MAX_SCAN_SIZE &&
      !exhausted
    ) {
      const scanLimit = Math.min(
        BLOG_DIRECTORY_SCAN_BATCH_SIZE,
        BLOG_DIRECTORY_MAX_SCAN_SIZE - scanned
      )
      let blogsQuery = db
        .collection('blogs')
        .orderBy(FieldPath.documentId())
        .limit(scanLimit)
      if (afterId) blogsQuery = blogsQuery.startAfter(afterId)
      const snapshot = await blogsQuery.get().catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage: 'Blog directory could not be read.',
        })
      })
      if (snapshot.empty) break

      for (const document of snapshot.docs) {
        scanned += 1
        afterId = document.id
        const item = projectBlogDirectoryEntry(
          document.id,
          document.data() || {},
          scope
        )
        if (item) items.push(item)
        if (items.length >= limit) break
      }
      exhausted = snapshot.docs.length < scanLimit
    }

    return {
      items,
      ...(!exhausted && afterId ? { nextCursor: encodeCursor(afterId) } : {}),
    }
  }
)
