import { createError, defineEventHandler, setResponseHeaders } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import type { PublicBlogDetailResponse } from '../../../../models/blogPost-public.model.ts'
import {
  projectPublicBlogPost,
  readPublicBlogRuntimeScope,
} from '../../../utils/blog/public-projection.ts'

export default defineEventHandler(async (event): Promise<PublicBlogDetailResponse> => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })
  const slug = requireFirestoreDocumentId(event.context.params?.slug, 'Blog slug')
  const scope = readPublicBlogRuntimeScope(event)
  if (!scope) throw createError({ statusCode: 404, statusMessage: 'Blog post not found' })

  const snapshot = await getRuntimeFirestore().collection('blogs').doc(slug).get().catch(() => {
    throw createError({ statusCode: 503, statusMessage: 'Blog post could not be read.' })
  })
  const item = snapshot.exists
    ? projectPublicBlogPost(snapshot.id, snapshot.data() || {}, scope)
    : null
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Blog post not found' })
  return { item }
})
