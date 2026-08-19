// Concurrent edit — 2026-07-20 19:27 CEST — Repo Efficiency Pass 2 of 6: project public Admin avatars through the canonical safe fallback.
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { AppStorage } from '../../models/app.model.ts'
import { resolveUserAvatarSource } from '../../../user/utils/user-avatar.ts'
import { AppUserStorage, UserStorage } from '../../../user/models/user.model.ts'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../server/utils/getRuntimeFirestore'

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

function normalizeLimit(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 8
  return Math.max(1, Math.min(24, Math.trunc(parsed)))
}

function mapUser(
  uid: string,
  data: Record<string, unknown> | null
): PublicAppAdmin {
  if (!data) {
    return {
      id: uid,
      displayName: 'Admin profile unavailable',
      handle: '',
      avatar: resolveUserAvatarSource(''),
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
    avatar: resolveUserAvatarSource(data.avatar),
    profiles: [],
    ...(!displayName ? { unavailable: true } : {}),
  }
}

export async function readAppAdmins(event: H3Event) {
  const cfg = useFireUXConfig(event)
  const runtime = useRuntimeConfig(event)
  const appDb = getRuntimeFirestore()
  const identityDb = getRuntimeIdentityFirestore()
  const limit = normalizeLimit(
    (runtime.public as Record<string, unknown> | undefined)?.footerAdminLimit
  )

  try {
    const memberships = await appDb
      .collection(AppStorage.collection)
      .doc(cfg.appId)
      .collection(AppUserStorage.collection)
      .where('role', '==', 'admin')
      .limit(limit)
      .get()

    const admins: PublicAppAdmin[] = []

    for (const membership of memberships.docs) {
      const uid = membership.id.trim()
      if (!uid) continue

      const userSnap = await identityDb
        .collection(UserStorage.collection)
        .doc(uid)
        .get()
      admins.push(mapUser(uid, userSnap.exists ? userSnap.data() || {} : null))
    }

    return {
      ok: true,
      appId: cfg.appId,
      count: admins.length,
      admins,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    const expectedMissingCredentials =
      message.includes('Could not load the default credentials') ||
      message.includes('admin credentials unavailable')

    if (import.meta.dev && !expectedMissingCredentials) {
      console.warn('[public/app/admins] unavailable:', message)
    }

    return {
      ok: false,
      appId: cfg.appId,
      count: 0,
      admins: [],
      unavailable: true,
      reason: 'admin_credentials_unavailable',
    }
  }
}
