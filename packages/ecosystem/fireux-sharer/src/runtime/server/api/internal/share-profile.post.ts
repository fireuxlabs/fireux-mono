import { FieldValue } from 'firebase-admin/firestore'
import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { serverShareProfilesTarget } from '../../share-profile-target'
import type { ShareProfileLink } from '../../../share-profile/models/share-profile.model'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function validLinks(value: unknown): ShareProfileLink[] {
  if (!Array.isArray(value) || value.length > 10) {
    fail(400, 'A Share Profile can contain up to 10 links.')
  }
  return value.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return fail(400, 'Every link needs a platform and URL.')
    }
    const data = entry as Record<string, unknown>
    const id = String(data.id || '').trim()
    const label = String(data.label || '').trim()
    const rawUrl = String(data.url || '').trim()
    if (!id || id.length > 80 || !label || label.length > 40) {
      return fail(400, 'Every link needs a valid platform and id.')
    }
    if (label.toLowerCase() === 'email') {
      if (id !== 'email' || !validEmailAddress(rawUrl)) {
        return fail(400, 'Email needs a valid address.')
      }
      return { id: 'email', label: 'Email', url: rawUrl.toLowerCase() }
    }
    let url: URL
    try {
      url = new URL(rawUrl)
    } catch {
      return fail(400, 'Every link needs a valid URL.')
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.href.length > 2048) {
      return fail(400, 'Links must use http:// or https://.')
    }
    return { id, label, url: url.toString() }
  })
}

function validEmailAddress(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig(event)
  const appId = String(runtime.public?.fireux?.id || '').trim()
  if (!appId) fail(500, 'The active App is not configured.')

  const body = await readBody<{ links?: unknown }>(event)
  const links = validLinks(body?.links)
  const memberships = serverAppUsersTarget(appId)
  return runGuardedServerTransaction(
    serverShareProfilesTarget.database,
    async (mutations) => {
    const [membership, profile] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, uid),
      mutations.read(serverShareProfilesTarget, appId),
    ])
    const role = String(membership.data?.role || '')
    if (!membership.exists || !['admin', 'dev'].includes(role)) {
      fail(403, 'App administrator access is required.')
    }

    const updated = { at: FieldValue.serverTimestamp(), by: uid }
    if (profile.exists) {
      mutations.update(serverShareProfilesTarget, appId, { links, updated })
    } else {
      mutations.create(serverShareProfilesTarget, appId, {
        app_id: appId,
        links,
        created: updated,
        updated,
      })
    }
    return { ok: true, appId, created: !profile.exists, links }
    }
  )
})
