import { useRuntimeConfig } from '#imports'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { createError, defineEventHandler, readBody } from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from '../../../../utils/firestore-mutations/targets'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { ensureRuntimeAppMeta } from '../../../utils/app-projection/ensure'
import { runGuardedServerTransaction } from '../../../utils/firestore-mutations/server-transaction'

const TEXT_FIELDS = {
  name: 60,
  short_name: 40,
  description: 500,
} as const
const ASSET_FIELDS = new Set([
  'assets.thumbnail',
  'assets.logo',
  'assets.wordmark',
  'assets.wordmark_light',
  'assets.wordmark_dark',
  'assets.cover',
])

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function cleanUrl(value: unknown): string {
  const text = String(value ?? '').trim()
  if (!text) return ''
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return fail(400, 'App assets must use a valid HTTPS URL.')
  }
  if (url.protocol !== 'https:') fail(400, 'App assets must use HTTPS.')
  return url.toString()
}

function normalizePatch(body: unknown): DocumentData {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'App settings payload must be an object.')
  }
  const input = body as Record<string, unknown>
  const patch: DocumentData = {}
  for (const [field, value] of Object.entries(input)) {
    if (field in TEXT_FIELDS) {
      const limit = TEXT_FIELDS[field as keyof typeof TEXT_FIELDS]
      const text = String(value ?? '')
        .trim()
        .slice(0, limit)
      if ((field === 'name' || field === 'short_name') && !text) {
        fail(400, `${field} is required.`)
      }
      patch[field] = text
      continue
    }
    if (ASSET_FIELDS.has(field)) {
      patch[field] = cleanUrl(value)
      continue
    }
    fail(400, `App setting is not editable: ${field}`)
  }
  if (!Object.keys(patch).length) fail(400, 'No App settings were supplied.')
  return patch
}

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const config = useFireUXConfig(event)
  const runtime = useRuntimeConfig(event)
  const patch = normalizePatch(await readBody(event))
  const apps = FIRESTORE_MUTATION_TARGETS.runtimeApps
  const memberships = serverAppUsersTarget(config.appId)

  await runGuardedServerTransaction(apps.database, async (mutations) => {
    const [app, membership] = await Promise.all([
      mutations.read(apps, config.appId),
      mutations.read<Record<string, unknown>>(memberships, uid),
    ])
    if (!app.exists) fail(409, 'The runtime App record does not exist.')
    const isAdmin = membership.data?.role === 'admin'
    const isDeveloper =
      Boolean(config.developerId) && uid === config.developerId
    if (!isAdmin && !isDeveloper) fail(403, 'App admin access is required.')

    mutations.update(apps, config.appId, {
      ...patch,
      updated: { at: FieldValue.serverTimestamp(), by: uid },
    })
  })

  const appDatabaseId = String(
    runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()
  const projection = await ensureRuntimeAppMeta({
    actorUid: uid,
    appDatabaseId,
    config,
  })
  return { ok: true, appId: config.appId, projection }
})
