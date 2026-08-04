// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: exact-load one eligible Job through the same allowlist.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: exact-load canonical Company and Place display relationships.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: keep all-category public details enabled without a literal wildcard id.
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  isFirestoreDocumentId,
  requireFirestoreDocumentId,
} from 'fireux-core/runtime/server/utils/ids/path'
import { CompanyStorage } from 'fireux-companies/runtime/models/company.model'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import type { PublicJobDetailResponse } from '../../../../models/job-public.model.ts'
import {
  isPublicJobCandidate,
  projectPublicJob,
  readPublicJobRuntimeScope,
} from '../../../utils/job/public-projection.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async (event): Promise<PublicJobDetailResponse> => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })

  const id = requireFirestoreDocumentId(event.context.params?.id, 'Job id')
  const scope = readPublicJobRuntimeScope(event)
  if (scope.categoryScope === 'allowlist' && !scope.categories.size) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }

  const db = getRuntimeFirestore()
  const snapshot = await db
    .collection('jobs')
    .doc(id)
    .get()
    .catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Job could not be read.',
      })
    })
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }
  const data = snapshot.data() || {}
  if (!isPublicJobCandidate(snapshot.id, data, scope)) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }

  const companyId = text(data.company_id)
  const placeId = text(data.place_id)
  if (!isFirestoreDocumentId(companyId) || !isFirestoreDocumentId(placeId)) {
    throw createError({
      statusCode: 503,
      statusMessage: 'The published Job has invalid relationships.',
    })
  }
  const [company, companyPlace, place] = await db.getAll(
    db.collection(CompanyStorage.collection).doc(companyId),
    db.collection(PlaceStorage.collection).doc(companyId),
    db.collection(PlaceStorage.collection).doc(placeId)
  ).catch(() => {
    throw createError({
      statusCode: 503,
      statusMessage: 'Job relationships could not be read.',
    })
  })

  let item: PublicJobDetailResponse['item'] | null = null
  try {
    item = projectPublicJob(snapshot.id, data, scope, {
      company: company.data() || {},
      companyPlace: companyPlace.data() || {},
      place: place.data() || {},
    })
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'The published Job is not canonical.',
    })
  }
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }

  return { item }
})
