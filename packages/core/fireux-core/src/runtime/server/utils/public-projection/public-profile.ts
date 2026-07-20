// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: provide bounded domain-owned profile handlers with canonical User joins.
import { FieldPath } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { resolveUserAvatarSource } from '../../../models/core/supporting/user-avatar'
import type {
  PublicCollectionResponse,
  PublicDetailResponse,
  PublicProfileDto,
  PublicProfileUserDto,
} from './public-dto.types'
import { getRuntimeIdentityFirestore } from '../getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../ids/path'

const CACHE_CONTROL =
  'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'
const DEFAULT_LIMIT = 100
const MAX_LIMIT = 200

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

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function normalizeLimit(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT
  return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(parsed)))
}

function mapCanonicalUser(
  snapshot: FirebaseFirestore.DocumentSnapshot,
  expectedProfile: PublicProfileKind
): PublicProfileUserDto | null {
  if (!snapshot.exists) return null
  const data = (snapshot.data() || {}) as Record<string, unknown>
  const displayName = String(data.display_name || '').trim()
  const handle = String(data.handle || '').trim().toLowerCase()
  const profiles = asStringList(data.profiles)
  if (
    !displayName ||
    displayName.length > 120 ||
    !/^[a-z0-9][a-z0-9-]{2,29}$/.test(handle) ||
    !profiles.includes(expectedProfile)
  ) {
    return null
  }

  return {
    id: snapshot.id,
    display_name: displayName,
    avatar: resolveUserAvatarSource(data.avatar),
    handle,
  }
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
  const user = mapCanonicalUser(userSnapshot, config.kind)
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
          ...profileSnapshot.docs.map((profile) => db.doc(`users/${profile.id}`))
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
    const id = requireFirestoreDocumentId(event.context.params?.id, 'Profile id')
    const db = getRuntimeIdentityFirestore()
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
