import {
  defineEventHandler,
  setResponseHeader,
  createError,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'

import { requireFirestoreDocumentId } from '../../utils/ids/path'
import type { CollectionResponse } from '../../../models/utils/directory'
import type { User } from '../../../user/models/user.model.ts'
import {
  readUserDirectoryScopeIds,
  resolveUserDirectoryScope,
  type UserDirectoryScope,
} from '../../../user/server/directory/scope'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import {
  isUserDirectoryEligible,
  normalizeUser,
} from '../../../user/utils/normalize-user.ts'

function normalizeLimit(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 200
  return Math.max(1, Math.min(1000, Math.trunc(parsed)))
}

function mapUser(doc: FirebaseFirestore.DocumentSnapshot): User | null {
  if (!doc.exists) return null
  const user = normalizeUser(doc.id, doc.data())
  return user && isUserDirectoryEligible(user) ? user : null
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

async function readTenantAppUsers(
  scope: Extract<UserDirectoryScope, { kind: 'tenant-app' }>,
  limit: number,
  cursor: string
): Promise<{ items: User[]; nextCursor: string | null }> {
  const candidates = await readUserDirectoryScopeIds(scope, limit + 1, cursor)
  const userIds = candidates.slice(0, limit)
  const nextCursor = candidates.length > limit ? userIds.at(-1)! : null
  if (!userIds.length) return { items: [], nextCursor }

  const identityDb = getRuntimeIdentityFirestore()
  const snapshots = await identityDb.getAll(
    ...userIds.map((userId) => identityDb.collection('users').doc(userId))
  )
  const users = snapshots.flatMap((snapshot) => {
    const dto = mapUser(snapshot)
    return dto ? [dto] : []
  })

  return {
    items: users.sort((left, right) => left.handle.localeCompare(right.handle)),
    nextCursor,
  }
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })

  const query = getQuery(event)
  const limit = normalizeLimit(query.limit)
  const scope = resolveUserDirectoryScope()
  const cursor =
    query.cursor == null
      ? ''
      : requireFirestoreDocumentId(query.cursor, 'User directory cursor')
  if (cursor && scope.kind !== 'tenant-app') {
    throw createError({
      statusCode: 400,
      statusMessage: 'This directory does not accept a cursor.',
    })
  }

  const page =
    scope.kind === 'tenant-app'
      ? await readTenantAppUsers(scope, limit, cursor)
      : { items: await readGlobalCanonicalUsers(limit), nextCursor: null }

  const response: CollectionResponse<User> & { nextCursor: string | null } = {
    ok: true,
    count: page.items.length,
    generatedAt: new Date().toISOString(),
    ...page,
  }

  return response
})
