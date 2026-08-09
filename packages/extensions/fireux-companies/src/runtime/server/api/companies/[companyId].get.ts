// Concurrent edit — 2026-07-21 14:41 CEST — Company public projection: exact-load one complete pair without caching materialization misses.
// Concurrent edit — 2026-07-21 15:20 CEST — Misebox Nitro startup fix: resolve the Place model through its explicit TypeScript server import.
import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import type { PublicCompanyDetailResponse } from '../../../models/company-public.model'
import { CompanyStorage } from '../../../models/company.model'
import { projectPublicCompanyDetail } from '../../company/public-projection'

export default defineEventHandler(async (event): Promise<PublicCompanyDetailResponse> => {
  const id = requireFirestoreDocumentId(getRouterParam(event, 'companyId'), 'Company id')
  const db = getRuntimeFirestore()
  const [company, place] = await db.getAll(
    db.collection(CompanyStorage.collection).doc(id),
    db.collection(PlaceStorage.collection).doc(id)
  ).catch(() => {
    throw createError({ statusCode: 503, statusMessage: 'Company could not be read.' })
  })
  const item = company.exists && place.exists
    ? projectPublicCompanyDetail(id, company.data() || {}, place.data() || {})
    : null
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Company not found.' })
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
  })
  return { item }
})
