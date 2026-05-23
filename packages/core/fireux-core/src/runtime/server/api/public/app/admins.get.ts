import { useRuntimeConfig } from '#imports'
import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { getRuntimeFirestore } from '../../../utils/getRuntimeFirestore'

type PublicAppAdmin = {
  id: string
  displayName: string
  handle: string
  avatar: string
  profiles: string[]
  unavailable?: boolean
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((entry) => asString(entry)).filter(Boolean)
    : []
}

function normalizeLimit(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 8
  return Math.max(1, Math.min(24, Math.trunc(parsed)))
}

function mapUser(uid: string, data: Record<string, unknown> | null): PublicAppAdmin {
  if (!data) {
    return {
      id: uid,
      displayName: 'Admin profile unavailable',
      handle: '',
      avatar: '',
      profiles: [],
      unavailable: true,
    }
  }

  const handle = asString(data.handle).toLowerCase()
  const displayName = asString(data.display_name)

  return {
    id: uid,
    displayName: displayName || 'Admin profile unavailable',
    handle,
    avatar: asString(data.avatar),
    profiles: asStringArray(data.profiles),
    ...(!displayName ? { unavailable: true } : {}),
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const cfg = useFireUXConfig()
  const runtime = useRuntimeConfig(event)
  const db = getRuntimeFirestore()
  const limit = normalizeLimit(
    (runtime.public as Record<string, unknown> | undefined)?.footerAdminLimit
  )

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  })

  const memberships = await db
    .collection('apps')
    .doc(cfg.appId)
    .collection('users')
    .where('role', '==', 'admin')
    .limit(limit)
    .get()

  const admins: PublicAppAdmin[] = []

  for (const membership of memberships.docs) {
    const uid = membership.id.trim()
    if (!uid) continue

    const userSnap = await db.collection('users').doc(uid).get()
    admins.push(mapUser(uid, userSnap.exists ? userSnap.data() || {} : null))
  }

  return {
    ok: true,
    appId: cfg.appId,
    count: admins.length,
    admins,
  }
})
