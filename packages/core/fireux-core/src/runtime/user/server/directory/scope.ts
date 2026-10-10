import { useRuntimeConfig } from '#imports'
import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'

export type UserDirectoryScope =
  | { kind: 'global' }
  | { kind: 'tenant-app'; appId: string }

function invalidMembership(userId: string): never {
  throw createError({
    statusCode: 409,
    statusMessage: `App member ${userId} has an invalid role.`,
  })
}

function validateMembership(
  snapshot: FirebaseFirestore.DocumentSnapshot
): boolean {
  if (!snapshot.exists) return false

  const role = snapshot.get('role')
  if (role !== 'admin' && role !== 'user' && role !== 'dev') {
    invalidMembership(snapshot.id)
  }
  return true
}

export function resolveUserDirectoryScope(): UserDirectoryScope {
  const runtime = useRuntimeConfig()
  const fireux = runtime.public?.fireux as Record<string, unknown> | undefined
  const role = String(fireux?.role || '').trim()
  if (role !== 'tenant') return { kind: 'global' }

  const appId = String(fireux?.id || '').trim()
  if (!appId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The tenant App identity is not configured.',
    })
  }

  return { kind: 'tenant-app', appId }
}

export async function readUserDirectoryScopeIds(
  scope: UserDirectoryScope,
  limit: number,
  cursor = ''
): Promise<string[]> {
  if (scope.kind !== 'tenant-app') return []

  let query = getRuntimeFirestore()
    .collection('apps')
    .doc(scope.appId)
    .collection('users')
    .orderBy(FieldPath.documentId())
  if (cursor) query = query.startAfter(cursor)
  const snapshot = await query.limit(limit).get()

  return snapshot.docs.map((document) => {
    validateMembership(document)
    return document.id
  })
}

export async function userBelongsToDirectoryScope(
  scope: UserDirectoryScope,
  userId: string
): Promise<boolean> {
  if (scope.kind !== 'tenant-app') return true
  if (!userId) return false

  const membership = await getRuntimeFirestore()
    .collection('apps')
    .doc(scope.appId)
    .collection('users')
    .doc(userId)
    .get()

  return validateMembership(membership)
}
