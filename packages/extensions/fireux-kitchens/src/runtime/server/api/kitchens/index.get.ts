import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { Kitchen } from '../../../kitchen/models/kitchen.model.ts'
import { readKitchens } from '../../../kitchen/server/index/read.ts'

const text = (value: unknown) => String(value ?? '').trim()

async function requireHiddenKitchenAccess(
  event: H3Event,
  db: ReturnType<typeof getRuntimeFirestore>
) {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to view hidden Kitchens.'
  )
  const { appId, developerId } = useFireUXConfig()
  const isDeveloper = import.meta.dev && uid === text(developerId)
  const membership = await db.doc(`apps/${appId}/users/${uid}`).get()
  const isAdmin = membership.exists && text(membership.data()?.role) === 'admin'

  if (!isDeveloper && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Developer or App admin access is required.',
    })
  }
}

export default defineEventHandler(
  async (event): Promise<Kitchen[]> => {
    const query = getQuery(event)
    const includeHidden = text(query.includeHidden) === 'true'
    if (query.includeHidden && !includeHidden) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hidden Kitchen mode is invalid.',
      })
    }
    if (query.visibility) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Kitchen collection visibility is not caller-selectable.',
      })
    }

    const db = getRuntimeFirestore()
    if (includeHidden) await requireHiddenKitchenAccess(event, db)
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    })

    return readKitchens({
      placeId: query.placeId,
      includeHidden,
    })
  }
)
