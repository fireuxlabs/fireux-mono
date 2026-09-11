import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { createError, setResponseHeaders } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { BlogDetailResponse } from '../../../models/blog-directory.model.ts'
import { projectBlogDetail, readBlogRuntimeScope } from '../../blog/read.ts'

export default defineLiveReadHandler(
  async (event): Promise<BlogDetailResponse> => {
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
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
