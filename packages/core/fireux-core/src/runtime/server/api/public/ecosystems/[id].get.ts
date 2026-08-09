import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { EcosystemStorage } from '../../../../models/core/ecosystem.model'
import { getRuntimeIdentityFirestore } from '../../../utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../utils/ids/path'
import { asTrimmedString } from '../../../utils/public-projection/public-dto.helpers'
import { projectPublicEcosystem } from '../../../utils/public-projection/public-ecosystem.dto'
import type { PublicDetailResponse } from '../../../utils/public-projection/public-dto.types'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  const ecosystemId = requireFirestoreDocumentId(
    getRouterParam(event, 'id'),
    'Ecosystem id'
  )
  const ownerId = asTrimmedString(useFireUXConfig(event).ecosystemId)
  if (!ownerId || ecosystemId !== ownerId) {
    throw createError({ statusCode: 404, statusMessage: 'Ecosystem not found' })
  }

  const snapshot = await getRuntimeIdentityFirestore()
    .collection(EcosystemStorage.collection)
    .doc(ecosystemId)
    .get()
  const raw = snapshot.exists ? snapshot.data() : null
  if (!raw || asTrimmedString(raw.status) !== 'active') {
    throw createError({ statusCode: 404, statusMessage: 'Ecosystem not found' })
  }

  const ecosystem = projectPublicEcosystem(raw, { id: snapshot.id })
  if (!ecosystem) {
    throw createError({ statusCode: 404, statusMessage: 'Ecosystem not found' })
  }

  const response: PublicDetailResponse<typeof ecosystem> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: ecosystem,
  }
  return response
})
