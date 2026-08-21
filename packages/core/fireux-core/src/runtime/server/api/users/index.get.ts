import { defineEventHandler, getQuery, setResponseHeaders, type H3Event, } from 'h3'
import {
  asBoundedTrimmedString, asTrimmedString, } from '../../utils/projection/normalize'
import type { CollectionResponse } from '../../../models/utils/directory'
import type { User } from '../../../user/models/user.model.ts'
import {
  readUserDirectoryScopeIds, resolveUserDirectoryScope, type UserDirectoryScope, } from '../../../user/server/directory/scope'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import { resolveUserAvatarSource } from '../../../user/utils/user-avatar.ts'

const CACHE_CONTROL = 'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'

function normalizeLimit(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 200
  return Math.max(1, Math.min(1000, Math.trunc(parsed)))
}

function normalizeHandle(value: unknown): string {
  return asTrimmedString(value).toLowerCase()
}

function mapUser(
  doc: FirebaseFirestore.DocumentSnapshot
): User | null {
  if (!doc.exists) return null
  const data = (doc.data() || {}) as Record<string, unknown>
  const handle = normalizeHandle(data.handle)
  if (!handle) return null

  return {
    id: doc.id,
    handle,
    display_name: asTrimmedString(data.display_name) || `@${handle}`,
    bio: asBoundedTrimmedString(data.bio, 280),
    avatar: resolveUserAvatarSource(data.avatar),
  }
}

async function readGlobalCanonicalUsers(limit: number): Promise<User[]> {
  const snapshot = await getRuntimeIdentityFirestore()
    .collection('users')
    .orderBy('handle')
    .limit(limit)
    .get()

  const out: User[] = []
  for (const doc of snapshot.docs) {
    const dto = mapUser(doc)
    if (!dto) continue
    out.push(dto)
  }

  return out
}

async function readTenantCanonicalUsers(
  scope: Extract<UserDirectoryScope, { kind: 'tenant' }>,
  limit: number
): Promise<User[]> {
  const userIds = await readUserDirectoryScopeIds(scope, limit)
  if (!userIds.length) return []

  const identityDb = getRuntimeIdentityFirestore()
  const snapshots = await identityDb.getAll(
    ...userIds.map(userId =>
      identityDb.collection('users').doc(userId)
    )
  )
  const users = snapshots.flatMap((snapshot) => {
    const dto = mapUser(snapshot)
    return dto ? [dto] : []
  })

  return users.sort((left, right) =>
    left.handle.localeCompare(right.handle)
  )
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
  })

  const query = getQuery(event)
  const limit = normalizeLimit(query.limit)
  const scope = resolveUserDirectoryScope()

  const users =
    scope.kind === 'tenant'
      ? await readTenantCanonicalUsers(scope, limit)
      : await readGlobalCanonicalUsers(limit)

  const response: CollectionResponse<User> = {
    ok: true,
    count: users.length,
    generatedAt: new Date().toISOString(),
    items: users,
  }

  return response
})
