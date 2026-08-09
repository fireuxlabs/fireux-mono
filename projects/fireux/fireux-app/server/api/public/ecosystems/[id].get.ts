import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type { PublicDetailResponse } from 'fireux-core/runtime/server/utils/public-projection/public-dto.types'
import { projectPublicEcosystem } from 'fireux-core/runtime/server/utils/public-projection/public-ecosystem.dto'
import { readPlatformDirectory } from '../../../utils/default-directory'
import { getFirestoreDb } from '../../../utils/firebase-admin'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=120, s-maxage=600',
  })
  const ecosystemId = requireFirestoreDocumentId(
    getRouterParam(event, 'id'),
    'Ecosystem id'
  )
  const directory = await readPlatformDirectory()
  let ecosystem = directory.ecosystems.find((entry) => entry.id === ecosystemId)
  if (!ecosystem && ecosystemId === 'fireux') {
    const snapshot = await (await getFirestoreDb('fireux'))
      .collection('ecosystems')
      .doc(ecosystemId)
      .get()
    const projected = snapshot.exists
      ? projectPublicEcosystem(snapshot.data(), { id: snapshot.id })
      : null
    if (projected?.status === 'active') {
      ecosystem = {
        ...projected,
        detail_url: `/ecosystems/${encodeURIComponent(projected.id)}`,
        app_count: directory.apps.filter(
          (app) => app.ecosystem_id === projected.id
        ).length,
      }
    }
  }
  if (!ecosystem) {
    throw createError({ statusCode: 404, statusMessage: 'Ecosystem not found' })
  }
  const response: PublicDetailResponse<typeof ecosystem> = {
    ok: true,
    generatedAt: directory.generatedAt,
    item: ecosystem,
  }
  return response
})
