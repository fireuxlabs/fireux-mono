import { FieldValue } from 'firebase-admin/firestore'
import { createError, readBody, type H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'

import { normalizeAppSettings } from './normalize'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export async function updateAppSettings(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const config = useFireUXConfig(event)
  const patch = normalizeAppSettings(await readBody(event))
  const apps = FIRESTORE_MUTATION_TARGETS.runtimeApps
  const memberships = serverAppUsersTarget(config.appId)

  await runGuardedServerTransaction(apps.database, async (mutations) => {
    const [app, membership] = await Promise.all([
      mutations.read(apps, config.appId),
      mutations.read<Record<string, unknown>>(memberships, uid),
    ])
    if (!app.exists) fail(409, 'The runtime App record does not exist.')
    const membershipRole = membership.data?.role
    const isAdmin = membershipRole === 'admin' || membershipRole === 'dev'
    const isDeveloper =
      Boolean(config.developerId) && uid === config.developerId
    if (!isAdmin && !isDeveloper) fail(403, 'App admin access is required.')

    mutations.update(apps, config.appId, {
      ...patch,
      updated: { at: FieldValue.serverTimestamp(), by: uid },
    })
  })

  return { ok: true, appId: config.appId }
}
