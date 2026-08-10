// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: fail closed when projecting public User avatars.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: project bounded biography into public User detail and SEO.
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import {
  asBoundedTrimmedString,
  asTrimmedString,
  buildPublicPath,
  resolvePublicDescription,
  toIsoUpdatedAt,
} from '../../../utils/public-projection/public-dto.helpers'
import type {
  PublicDetailResponse,
  PublicUserDto,
} from '../../../utils/public-projection/public-dto.types'
import {
  publicUserBelongsToScope,
  resolvePublicUserScope,
} from '../../../utils/public-projection/public-user-scope'
import { getRuntimeIdentityFirestore } from '../../../utils/getRuntimeFirestore'
import { UserStorage } from '../../../../models/core/user.model'
import { resolveUserAvatarSource } from '../../../../utils/user-avatar.ts'

const CACHE_CONTROL = 'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'

function normalizeHandle(value: unknown): string {
  return asTrimmedString(value).toLowerCase()
}

function mapUserDocToDto(
  doc: FirebaseFirestore.QueryDocumentSnapshot
): PublicUserDto | null {
  const data = (doc.data() || {}) as Record<string, unknown>
  const handle = normalizeHandle(data.handle)
  if (!handle) return null

  const displayName =
    asTrimmedString(data.display_name) ||
    asTrimmedString(data.displayName) ||
    `@${handle}`
  const assets = data.assets as Record<string, unknown> | undefined
  const avatar = resolveUserAvatarSource(assets?.avatar)
  const bio = asBoundedTrimmedString(data.bio, 280)

  return {
    id: doc.id,
    handle,
    displayName,
    bio,
    assets: { avatar },
    title: displayName,
    description: resolvePublicDescription(
      bio,
      `Public profile for ${displayName}.`
    ),
    path: buildPublicPath('/users', handle),
    image: avatar || undefined,
    updatedAt: toIsoUpdatedAt(
      data.updatedAt || (data.updated as any)?.at || data.updated_at || data.createdAt
    ),
    isPublic: true,
  }
}

async function readCanonicalUserByHandle(
  handle: string
): Promise<PublicUserDto | null> {
  const snap = await getRuntimeIdentityFirestore()
    .collection(UserStorage.collection)
    .where('handle', '==', handle)
    .limit(1)
    .get()
  const doc = snap.docs[0] || null
  if (!doc) return null
  const dto = mapUserDocToDto(doc)
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
    !(await publicUserBelongsToScope(resolvePublicUserScope(), user.id))
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  const response: PublicDetailResponse<PublicUserDto> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: user,
  }

  return response
})
