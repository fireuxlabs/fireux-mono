import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import type {
  CollectionResponse,
  DetailResponse,
} from '../../../models/utils/directory.ts'
import type {
  ProfileDirectoryEntry,
  ProfileUser,
} from '../../models/user-directory.model.ts'
import { getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import { readUserIdentitySummary } from '../identity/summary'

const CACHE_CONTROL =
  'public, max-age=120, s-maxage=600, stale-while-revalidate=3600'
const DEFAULT_LIMIT = 100
const MAX_LIMIT = 200
const USER_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{2,29}$/

export type ProfileKind = ProfileDirectoryEntry['kind']
export type ProfileDirectoryMapper = (
  data: Record<string, unknown>,
  mode: 'index' | 'detail'
) => Record<string, unknown> | null

export type ProfileDirectoryConfig = {
  kind: ProfileKind
  mapProfile: ProfileDirectoryMapper
  rootCollection?: string
}

function normalizeLimit(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT
  return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(parsed)))
}

function mapCanonicalUser(
  snapshot: FirebaseFirestore.DocumentSnapshot
): ProfileUser | null {
  return readUserIdentitySummary(snapshot)
}

function mapEntry(
  config: ProfileDirectoryConfig,
  profileSnapshot: FirebaseFirestore.DocumentSnapshot | undefined,
  userSnapshot: FirebaseFirestore.DocumentSnapshot | undefined,
  mode: 'index' | 'detail'
): ProfileDirectoryEntry | null {
  if (!profileSnapshot || !userSnapshot) return null
  const path = profileSnapshot.ref.path.split('/')
  const userId = config.rootCollection
    ? path.length === 2 && path[0] === config.rootCollection
      ? profileSnapshot.id
      : ''
    : path.length === 4 &&
        path[0] === 'users' &&
        path[2] === 'profiles' &&
        path[3] === config.kind
      ? path[1]
      : ''
  if (!profileSnapshot.exists || !userId || userId !== userSnapshot.id) {
    return null
  }
  const user = mapCanonicalUser(userSnapshot)
  const profile = config.mapProfile(
    (profileSnapshot.data() || {}) as Record<string, unknown>,
    mode
  )
  if (!user || !profile) return null
  return { id: userId, kind: config.kind, profile, user }
}

function setPublicHeaders(event: H3Event) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
  })
}

export function createProfileDirectoryHandler(config: ProfileDirectoryConfig) {
  return defineEventHandler(async (event: H3Event) => {
    setPublicHeaders(event)
    const limit = normalizeLimit(getQuery(event).limit)
    const db = getRuntimeIdentityFirestore()
    const profileSnapshot = config.rootCollection
      ? await db.collection(config.rootCollection).limit(limit).get()
      : await db
          .collectionGroup('profiles')
          .where('kind', '==', config.kind)
          .limit(limit)
          .get()
    const userSnapshots = profileSnapshot.empty
      ? []
      : await db.getAll(
          ...profileSnapshot.docs.map((profile) =>
            db.doc(
              `users/${config.rootCollection ? profile.id : profile.ref.parent.parent?.id || ''}`
            )
          )
        )

    const items = profileSnapshot.docs
      .map((profile, index) =>
        mapEntry(config, profile, userSnapshots[index], 'index')
      )
      .filter((entry): entry is ProfileDirectoryEntry => Boolean(entry))

    const response: CollectionResponse<ProfileDirectoryEntry> = {
      ok: true,
      count: items.length,
      generatedAt: new Date().toISOString(),
      items,
    }
    return response
  })
}

export function createProfileDetailHandler(config: ProfileDirectoryConfig) {
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
      db.doc(
        config.rootCollection
          ? `${config.rootCollection}/${id}`
          : `users/${id}/profiles/${config.kind}`
      ),
      db.doc(`users/${id}`)
    )
    const item = mapEntry(config, profile, user, 'detail')
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
    }

    const response: DetailResponse<ProfileDirectoryEntry> = {
      ok: true,
      generatedAt: new Date().toISOString(),
      item,
    }
    return response
  })
}
