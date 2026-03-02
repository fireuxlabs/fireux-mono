import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import {
  asStringArray,
  asTrimmedString,
  buildPublicPath,
  fallbackDescription,
  toIsoUpdatedAt,
} from '../../../utils/public-projection/public-dto.helpers'
import type {
  PublicDetailResponse,
  PublicUserDto,
} from '../../../utils/public-projection/public-dto.types'
import {
  readFirstPublicDocByField,
} from '../../../utils/public-projection/public-firestore'

const CACHE_CONTROL = 'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'

function normalizeHandle(value: unknown): string {
  return asTrimmedString(value).toLowerCase()
}

function userIsPublic(data: Record<string, unknown>, handle: string): boolean {
  const explicitPublic = data.isPublic
  if (typeof explicitPublic === 'boolean') return explicitPublic

  const explicitVisibility = asTrimmedString(data.visibility).toLowerCase()
  if (explicitVisibility === 'public') return true
  if (explicitVisibility === 'private') return false

  const explicitFlag = data.public
  if (typeof explicitFlag === 'boolean') return explicitFlag

  return Boolean(handle)
}

function mapUserDocToDto(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  options: { fallbackHandle?: string; fallbackPublic?: boolean } = {}
): PublicUserDto | null {
  const data = (doc.data() || {}) as Record<string, unknown>
  const handle = normalizeHandle(data.handle || options.fallbackHandle || '')
  if (!handle) return null

  const displayName =
    asTrimmedString(data.display_name) ||
    asTrimmedString(data.displayName) ||
    `@${handle}`
  const bio = asTrimmedString(data.bio)
  const avatar = asTrimmedString(data.avatar)
  const isPublic =
    typeof options.fallbackPublic === 'boolean'
      ? options.fallbackPublic
      : userIsPublic(data, handle)

  return {
    id: doc.id,
    handle,
    displayName,
    avatar,
    bio,
    profiles: asStringArray(data.profiles),
    title: displayName,
    description: fallbackDescription(bio, `Public profile for ${displayName}.`),
    path: buildPublicPath('/users', handle),
    image: avatar || undefined,
    updatedAt: toIsoUpdatedAt(
      data.updatedAt || (data.updated as any)?.at || data.updated_at || data.createdAt
    ),
    isPublic,
  }
}

async function readCanonicalUserByHandle(
  handle: string
): Promise<PublicUserDto | null> {
  const doc = await readFirstPublicDocByField('users', 'handle', handle)
  if (!doc) return null
  const dto = mapUserDocToDto(doc)
  if (!dto?.isPublic) return null
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

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  const response: PublicDetailResponse<PublicUserDto> & { user: PublicUserDto } = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: user,
    user,
  }

  return response
})
