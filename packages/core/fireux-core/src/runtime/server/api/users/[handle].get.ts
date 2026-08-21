import { createError, defineEventHandler, setResponseHeaders, type H3Event, } from 'h3'
import {
  asBoundedTrimmedString, asTrimmedString, buildDirectoryPath, resolveDirectoryDescription, toIsoUpdatedAt, } from '../../utils/projection/normalize'
import type { DetailResponse } from '../../../models/utils/directory'
import type { UserDetail } from '../../../user/models/user-directory.model.ts'
import {
  resolveUserDirectoryScope, userBelongsToDirectoryScope, } from '../../../user/server/directory/scope'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import { resolveUserAvatarSource } from '../../../user/utils/user-avatar.ts'

const CACHE_CONTROL =
  'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'

function normalizeHandle(value: unknown): string {
  return asTrimmedString(value).toLowerCase()
}

function mapUserDetail(
  doc: FirebaseFirestore.QueryDocumentSnapshot
): UserDetail | null {
  const data = (doc.data() || {}) as Record<string, unknown>
  const handle = normalizeHandle(data.handle)
  if (!handle) return null

  const displayName =
    asTrimmedString(data.display_name) ||
    asTrimmedString(data.displayName) ||
    `@${handle}`
  const avatar = resolveUserAvatarSource(data.avatar)
  const bio = asBoundedTrimmedString(data.bio, 280)

  return {
    id: doc.id,
    handle,
    displayName,
    bio,
    avatar,
    title: displayName,
    description: resolveDirectoryDescription(
      bio,
      `Profile for ${displayName}.`
    ),
    path: buildDirectoryPath('/users', handle),
    image: avatar || undefined,
    updatedAt: toIsoUpdatedAt(
      data.updatedAt ||
        (data.updated as any)?.at ||
        data.updated_at ||
        data.createdAt
    ),
  }
}

async function readCanonicalUserByHandle(
  handle: string
): Promise<UserDetail | null> {
  const snap = await getRuntimeIdentityFirestore()
    .collection('users')
    .where('handle', '==', handle)
    .limit(1)
    .get()
  const doc = snap.docs[0] || null
  if (!doc) return null
  const dto = mapUserDetail(doc)
  if (!dto) return null
  return dto
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
  })

  const rawHandle = event.context.params?.handle
  const handle = normalizeHandle(rawHandle)

  if (!handle) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user handle',
    })
  }

  const user = await readCanonicalUserByHandle(handle)

  if (
    !user ||
    !(await userBelongsToDirectoryScope(resolveUserDirectoryScope(), user.id))
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  const response: DetailResponse<UserDetail> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: user,
  }

  return response
})
