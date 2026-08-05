// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: provide bounded domain-owned profile handlers with canonical User joins.
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: reuse the canonical public User identity allowlist.
import { FieldPath } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import type {
  PublicCollectionResponse,
  PublicDetailResponse,
  PublicProfileDto,
  PublicProfileUserDto,
} from './public-dto.types'
import { getRuntimeIdentityFirestore } from '../getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../ids/path'
import { mapPublicUserIdentity } from './public-user-identity'

const CACHE_CONTROL =
  'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'
const DEFAULT_LIMIT = 100
const MAX_LIMIT = 200
const USER_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/

export type PublicProfileKind = PublicProfileDto['kind']
export type PublicProfileMapper = (
  data: Record<string, unknown>,
  mode: 'index' | 'detail'
) => Record<string, unknown> | null

export type PublicProfileHandlerConfig = {
  collection: string
  kind: PublicProfileKind
  mapProfile: PublicProfileMapper
}

function normalizeLimit(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT
  return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(parsed)))
}

function mapCanonicalUser(
  snapshot: FirebaseFirestore.DocumentSnapshot
): PublicProfileUserDto | null {
  return mapPublicUserIdentity(snapshot)
}

function mapEntry(
  config: PublicProfileHandlerConfig,
  profileSnapshot: FirebaseFirestore.DocumentSnapshot,
  userSnapshot: FirebaseFirestore.DocumentSnapshot,
  mode: 'index' | 'detail'
): PublicProfileDto | null {
  if (!profileSnapshot.exists || profileSnapshot.id !== userSnapshot.id) {
    return null
  }
  const user = mapCanonicalUser(userSnapshot)
  const profile = config.mapProfile(
    (profileSnapshot.data() || {}) as Record<string, unknown>,
    mode
  )
  if (!user || !profile) return null
  return { id: profileSnapshot.id, kind: config.kind, profile, user }
}

function setPublicHeaders(event: H3Event) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
  })
}

export function createPublicProfileCollectionHandler(
  config: PublicProfileHandlerConfig
) {
  return defineEventHandler(async (event: H3Event) => {
    setPublicHeaders(event)
    const limit = normalizeLimit(getQuery(event).limit)
    const db = getRuntimeIdentityFirestore()
    const profileSnapshot = await db
      .collection(config.collection)
      .orderBy(FieldPath.documentId())
      .limit(limit)
      .get()
    const userSnapshots = profileSnapshot.empty
      ? []
      : await db.getAll(
          ...profileSnapshot.docs.map((profile) =>
            db.doc(`users/${profile.id}`)
          )
        )

    const items = profileSnapshot.docs
      .map((profile, index) =>
        mapEntry(config, profile, userSnapshots[index], 'index')
      )
      .filter((entry): entry is PublicProfileDto => Boolean(entry))

    const response: PublicCollectionResponse<PublicProfileDto> = {
      ok: true,
      count: items.length,
      generatedAt: new Date().toISOString(),
      items,
    }
    return response
  })
}

export function createPublicProfileDetailHandler(
  config: PublicProfileHandlerConfig
) {
  return defineEventHandler(async (event: H3Event) => {
    setPublicHeaders(event)
    const identifier = requireFirestoreDocumentId(
      event.context.params?.id,
      'Profile identifier'
    )
    const db = getRuntimeIdentityFirestore()

    // Public profile identity is the canonical User handle. Root profile
    // documents remain keyed by User uid, so resolve the handle at the trusted
    // projection boundary and retain exact uid lookup for legacy links.
    const normalizedHandle = identifier.toLowerCase()
    const handleSnapshot = USER_HANDLE_PATTERN.test(normalizedHandle)
      ? await db
          .collection('users')
          .where('handle', '==', normalizedHandle)
          .limit(2)
          .get()
      : null

    if (handleSnapshot && handleSnapshot.size > 1) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Profile identity is not unique',
      })
    }

    const handleUser = handleSnapshot?.docs[0] ?? null
    const id = handleUser?.id ?? identifier
    const [profile, user] = await db.getAll(
      db.doc(`${config.collection}/${id}`),
      db.doc(`users/${id}`)
    )
    const item = mapEntry(config, profile, user, 'detail')
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
    }

    const response: PublicDetailResponse<PublicProfileDto> = {
      ok: true,
      generatedAt: new Date().toISOString(),
      item,
    }
    return response
  })
}
