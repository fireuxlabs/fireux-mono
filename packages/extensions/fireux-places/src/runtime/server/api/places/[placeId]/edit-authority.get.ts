import { useRuntimeConfig } from '#imports'
import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { createdByCurrentApp } from '../../../place/onboarding-context'

export type PlaceEditAuthorityResponse = {
  ok: true
  can_edit: boolean
  authority: 'creator' | 'app_admin' | null
}

export default defineEventHandler(
  async (event): Promise<PlaceEditAuthorityResponse> => {
    const { uid } = await requireFirebaseBearerUser(event)
    const placeId = requireFirestoreDocumentId(
      getRouterParam(event, 'placeId'),
      'Place id'
    )
    const appId = requireFirestoreDocumentId(
      useRuntimeConfig(event).public?.fireux?.id,
      'Runtime App id'
    )
    const db = getRuntimeFirestore()
    const [place, membership] = await db.getAll(
      db.doc(`places/${placeId}`),
      db.doc(`apps/${appId}/users/${uid}`)
    )
    if (!place.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Place not found.' })
    }
    const isAdmin = membership.exists && membership.get('role') === 'admin'
    const isCreator = createdByCurrentApp(place.data() || {}, uid, appId)
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    })
    return {
      ok: true,
      can_edit: isAdmin || isCreator,
      authority: isAdmin ? 'app_admin' : isCreator ? 'creator' : null,
    }
  }
)
