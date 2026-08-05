// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: fail closed when projecting public User avatars.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: project bounded biographies into public User cards and SEO.
import {
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import {
  asBoundedTrimmedString,
  asTrimmedString,
  buildPublicPath,
  resolvePublicDescription,
  toIsoUpdatedAt,
} from '../../utils/public-projection/public-dto.helpers'
import type {
  PublicCollectionResponse,
  PublicUserDto,
} from '../../utils/public-projection/public-dto.types'
import {
  readPublicUserScopeIds,
  resolvePublicUserScope,
  type PublicUserScope,
} from '../../utils/public-projection/public-user-scope'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import { UserStorage } from '../../../models/core/user.model'
import { resolveUserAvatarSource } from '../../../utils/user-avatar.ts'

const CACHE_CONTROL = 'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'

function normalizeLimit(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 200
  return Math.max(1, Math.min(1000, Math.trunc(parsed)))
}

function normalizeHandle(value: unknown): string {
  return asTrimmedString(value).toLowerCase()
}

function mapUserDocToDto(
  doc: FirebaseFirestore.DocumentSnapshot
): PublicUserDto | null {
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
  const description = resolvePublicDescription(
    bio,
    `Public profile for ${displayName}.`
  )
  const path = buildPublicPath('/users', handle)
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
    isPublic: true,
  }
}

async function readGlobalCanonicalUsers(limit: number): Promise<PublicUserDto[]> {
  const snapshot = await getRuntimeIdentityFirestore()
    .collection(UserStorage.collection)
    .orderBy('handle')
    .limit(limit)
    .get()

  const out: PublicUserDto[] = []
  for (const doc of snapshot.docs) {
    const dto = mapUserDocToDto(doc)
    if (!dto) continue
    out.push(dto)
  }

  return out
}

async function readTenantCanonicalUsers(
  scope: Extract<PublicUserScope, { kind: 'tenant' }>,
  limit: number
): Promise<PublicUserDto[]> {
  const userIds = await readPublicUserScopeIds(scope, limit)
  if (!userIds.length) return []

  const identityDb = getRuntimeIdentityFirestore()
  const snapshots = await identityDb.getAll(
    ...userIds.map(userId =>
      identityDb.collection(UserStorage.collection).doc(userId)
    )
  )
  const users = snapshots.flatMap((snapshot) => {
    const dto = mapUserDocToDto(snapshot)
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
  const scope = resolvePublicUserScope()

  const users =
    scope.kind === 'tenant'
      ? await readTenantCanonicalUsers(scope, limit)
      : await readGlobalCanonicalUsers(limit)

  const response: PublicCollectionResponse<PublicUserDto> & { users: PublicUserDto[] } = {
    ok: true,
    count: users.length,
    generatedAt: new Date().toISOString(),
    items: users,
    users,
  }

  return response
})
