import {
  defineEventHandler,
  setResponseHeader,
  createError,
  setResponseHeaders,
} from 'h3'

import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { BlogDetailResponse } from '../../../blog/models/blog-directory.model.ts'
import {
  projectBlogDetail,
  readBlogRuntimeScope,
} from '../../../blog/server/read.ts'

export default defineEventHandler(
  async (event): Promise<BlogDetailResponse> => {
    setResponseHeader(event, 'Cache-Control', 'no-store')

    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    const slug = requireFirestoreDocumentId(
      event.context.params?.slug,
      'Blog slug'
    )
    const scope = readBlogRuntimeScope(event)
    if (!scope)
      throw createError({
        statusCode: 404,
        statusMessage: 'Blog post not found',
      })

    const snapshot = await getRuntimeFirestore()
      .collection('blogs')
      .doc(slug)
      .get()
      .catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage: 'Blog post could not be read.',
        })
      })
    const item = snapshot.exists
      ? projectBlogDetail(snapshot.id, snapshot.data() || {}, scope)
      : null
    if (!item)
      throw createError({
        statusCode: 404,
        statusMessage: 'Blog post not found',
      })
    return { item }
  }
)
