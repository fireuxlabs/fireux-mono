// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: exact-load one eligible Job through the same allowlist.
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import type { PublicJobDetailResponse } from '../../../../models/job-public.model.ts'
import {
  projectPublicJob,
  readPublicJobRuntimeScope,
} from '../../../utils/job/public-projection.ts'

export default defineEventHandler(async (event): Promise<PublicJobDetailResponse> => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })

  const id = requireFirestoreDocumentId(event.context.params?.id, 'Job id')
  const scope = readPublicJobRuntimeScope(event)
  if (!scope.categories.size) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }

  const snapshot = await getRuntimeFirestore()
    .collection('jobs')
    .doc(id)
    .get()
    .catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Job could not be read.',
      })
    })
  const item = snapshot.exists
    ? projectPublicJob(snapshot.id, snapshot.data() || {}, scope)
    : null
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }

  return { item }
})
