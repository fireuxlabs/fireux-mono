import { defineLiveProjection } from 'fireux-core/runtime/server/utils/live-projection'
import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
import { createError, getQuery, setResponseHeaders, type H3Event } from 'h3'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { KitchenDirectoryEntry } from '../../../kitchen/types/public'
import { readKitchens } from '../../../kitchen/server/index/read.ts'

const text = (value: unknown) => String(value ?? '').trim()

async function requireHiddenKitchenAccess(
  event: H3Event,
  db: ReturnType<typeof getRuntimeFirestore>,
  sources: LiveProjectionSources
) {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to view hidden Kitchens.'
  )
  const { appId, developerId } = useFireUXConfig()
  const isDeveloper = import.meta.dev && uid === text(developerId)
  const membershipRef = db.doc(`apps/${appId}/users/${uid}`)
  sources.watch(membershipRef, { authority: true })
  const membership = await membershipRef.get()
  const isAdmin = membership.exists && text(membership.data()?.role) === 'admin'

  if (!isDeveloper && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Developer or App admin access is required.',
    })
  }
}

export default defineLiveProjection({
  access: (event) =>
    text(getQuery(event).includeHidden) === 'true' ? 'protected' : 'public',
  read: async (event, sources): Promise<KitchenDirectoryEntry[]> => {
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
    if (includeHidden) await requireHiddenKitchenAccess(event, db, sources)
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })

    return readKitchens(
      {
        placeId: query.placeId,
        includeHidden,
      },
      sources
    )
  },
})
