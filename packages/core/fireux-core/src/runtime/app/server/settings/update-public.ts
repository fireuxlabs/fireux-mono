import { createError, readBody, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import {
  serverAppPublicSettingsTarget,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/server-targets'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export async function updateAppPublicSettings(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const config = useFireUXConfig(event)
  const body = await readBody<{ field?: unknown; values?: unknown }>(event)
  const field = String(body?.field || '').trim()
  if (!/^featured_[a-z0-9_]+_slugs$/.test(field))
    fail(400, 'The featured-slug field is invalid.')
  if (!Array.isArray(body?.values)) fail(400, 'Featured slugs must be an array.')
  const values = [...new Set(body.values.map((value) => String(value || '').trim()).filter(Boolean))]
  if (values.length > 100 || values.some((value) => value.length > 160))
    fail(400, 'Featured slugs exceed the supported limit.')

  const settings = serverAppPublicSettingsTarget(config.appId)
  const memberships = serverAppUsersTarget(config.appId)
  await runGuardedServerTransaction(settings.database, async (mutations) => {
    const [current, membership] = await Promise.all([
      mutations.read(settings, 'public'),
      mutations.read<Record<string, unknown>>(memberships, uid),
    ])
    const role = membership.data?.role
    const isDeveloper = Boolean(config.developerId) && uid === config.developerId
    if (!['admin', 'dev'].includes(String(role || '')) && !isDeveloper)
      fail(403, 'App admin access is required.')
    if (current.exists) mutations.update(settings, 'public', { [field]: values })
    else mutations.create(settings, 'public', { [field]: values })
  })
  return { ok: true, appId: config.appId, field, values }
}
