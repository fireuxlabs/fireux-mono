import {
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import {
  asBoundedTrimmedString,
  asTrimmedString,
  buildDirectoryPath,
  resolveDirectoryDescription,
  toIsoUpdatedAt,
} from '../../utils/projection/normalize'
import type { CollectionResponse } from '../../../models/utils/directory'
import type { UserDetail } from '../../../user/models/user-directory.model.ts'
import {
  readUserDirectoryScopeIds,
  resolveUserDirectoryScope,
  type UserDirectoryScope,
} from '../../../user/server/directory/scope'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import { UserStorage } from '../../../user/models/user.model.ts'
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

function mapUserDetail(
  doc: FirebaseFirestore.DocumentSnapshot
): UserDetail | null {
  if (!doc.exists) return null
  const data = (doc.data() || {}) as Record<string, unknown>
  const handle = normalizeHandle(data.handle)
  if (!handle) return null

  const displayName =
    asTrimmedString(data.display_name) ||
    asTrimmedString(data.displayName) ||
    `@${handle}`
  const avatar = resolveUserAvatarSource(data.avatar)
  const bio = asBoundedTrimmedString(data.bio, 280)

  const title = displayName
  const description = resolveDirectoryDescription(
    bio,
    `Profile for ${displayName}.`
  )
  const path = buildDirectoryPath('/users', handle)
  const updatedAt = toIsoUpdatedAt(
    data.updatedAt || (data.updated as any)?.at || data.updated_at || data.createdAt
  )

  return {
    id: doc.id,
    handle,
    displayName,
    bio,
    avatar,
    title,
    description,
    path,
    image: avatar || undefined,
    updatedAt,
  }
}

async function readGlobalCanonicalUsers(limit: number): Promise<UserDetail[]> {
  const snapshot = await getRuntimeIdentityFirestore()
    .collection(UserStorage.collection)
    .orderBy('handle')
    .limit(limit)
    .get()

  const out: UserDetail[] = []
  for (const doc of snapshot.docs) {
    const dto = mapUserDetail(doc)
    if (!dto) continue
    out.push(dto)
  }

  return out
}

async function readTenantCanonicalUsers(
  scope: Extract<UserDirectoryScope, { kind: 'tenant' }>,
  limit: number
): Promise<UserDetail[]> {
  const userIds = await readUserDirectoryScopeIds(scope, limit)
  if (!userIds.length) return []

  const identityDb = getRuntimeIdentityFirestore()
  const snapshots = await identityDb.getAll(
    ...userIds.map(userId =>
      identityDb.collection(UserStorage.collection).doc(userId)
    )
  )
  const users = snapshots.flatMap((snapshot) => {
    const dto = mapUserDetail(snapshot)
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

  const response: CollectionResponse<UserDetail> & { users: UserDetail[] } = {
    ok: true,
    count: users.length,
    generatedAt: new Date().toISOString(),
    items: users,
    users,
  }

  return response
})
