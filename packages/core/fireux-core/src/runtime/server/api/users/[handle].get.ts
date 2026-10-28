import {
  defineEventHandler,
  setResponseHeader,
  createError,
  setResponseHeaders,
  type H3Event,
} from 'h3'

import type { DetailResponse } from '../../../models/utils/directory'
import type { User } from '../../../user/models/user.model.ts'
import {
  resolveUserDirectoryScope,
  userBelongsToDirectoryScope,
} from '../../../user/server/directory/scope'
import { getRuntimeIdentityFirestore } from '../../utils/getRuntimeFirestore'
import {
  isUserDirectoryEligible,
  normalizeUser,
} from '../../../user/utils/normalize-user.ts'

function normalizeHandle(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function mapUser(doc: FirebaseFirestore.QueryDocumentSnapshot): User | null {
  const user = normalizeUser(doc.id, doc.data())
  return user && isUserDirectoryEligible(user) ? user : null
}

async function readCanonicalUserByHandle(handle: string): Promise<User | null> {
  const snap = await getRuntimeIdentityFirestore()
    .collection('users')
    .where('handle', '==', handle)
    .limit(2)
    .get()
  if (snap.docs.length > 1) {
    throw createError({
      statusCode: 500,
      statusMessage: 'User identity is not unique',
    })
  }
  const doc = snap.docs[0] || null
  if (!doc) return null
  const dto = mapUser(doc)
  if (!dto) return null
  return dto
}

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
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

  const response: DetailResponse<User> = {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: user,
  }

  return response
})
