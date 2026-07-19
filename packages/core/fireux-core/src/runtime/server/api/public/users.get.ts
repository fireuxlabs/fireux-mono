import {
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import {
  asStringArray,
  asTrimmedString,
  buildPublicPath,
  resolvePublicDescription,
  toIsoUpdatedAt,
} from '../../utils/public-projection/public-dto.helpers'
import type {
  PublicCollectionResponse,
  PublicUserDto,
} from '../../utils/public-projection/public-dto.types'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import { UserStorage } from '../../../models/core/user.model'

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
  doc: FirebaseFirestore.QueryDocumentSnapshot
): PublicUserDto | null {
  const data = (doc.data() || {}) as Record<string, unknown>
  const handle = normalizeHandle(data.handle)
  if (!handle) return null

  const displayName =
    asTrimmedString(data.display_name) ||
    asTrimmedString(data.displayName) ||
    `@${handle}`
  const avatar = asTrimmedString(data.avatar)

  const title = displayName
  const description = resolvePublicDescription('', `Public profile for ${displayName}.`)
  const path = buildPublicPath('/users', handle)
  const updatedAt = toIsoUpdatedAt(
    data.updatedAt || (data.updated as any)?.at || data.updated_at || data.createdAt
  )

  return {
    id: doc.id,
    handle,
    displayName,
    avatar,
    apps: asStringArray(data.app_ids),
    profiles: asStringArray(data.profiles),
    title,
    description,
    path,
    image: avatar || undefined,
    updatedAt,
    isPublic: true,
  }
}

async function readCanonicalUsers(limit: number): Promise<PublicUserDto[]> {
  const snap = await getRuntimeIdentityFirestore()
    .collection(UserStorage.rootCollection)
    .orderBy('handle')
    .limit(limit)
    .get()

  const out: PublicUserDto[] = []
  for (const doc of snap.docs) {
    const dto = mapUserDocToDto(doc)
    if (!dto) continue
    out.push(dto)
  }

  return out
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
  })

  const query = getQuery(event)
  const limit = normalizeLimit(query.limit)

  const users = await readCanonicalUsers(limit)

  const response: PublicCollectionResponse<PublicUserDto> & { users: PublicUserDto[] } = {
    ok: true,
    count: users.length,
    generatedAt: new Date().toISOString(),
    items: users,
    users,
  }

  return response
})
