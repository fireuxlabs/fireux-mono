import { useRuntimeConfig } from '#imports'
import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { AppStorage } from '../../../app/models/app.model.ts'
import { AppUserStorage } from '../../models/user.model.ts'
import { getRuntimeFirestore } from '../../../server/utils/getRuntimeFirestore'

export type UserDirectoryScope =
  | { kind: 'global' }
  | { kind: 'tenant', appId: string }

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
  if (role !== 'admin' && role !== 'user') {
    invalidMembership(snapshot.id)
  }
  return true
}

export function resolveUserDirectoryScope(): UserDirectoryScope {
  const runtime = useRuntimeConfig()
  const fireux = runtime.public?.fireux as
    | Record<string, unknown>
    | undefined
  const role = String(fireux?.role || '').trim()
  if (role !== 'tenant') return { kind: 'global' }

  const appId = String(fireux?.id || '').trim()
  if (!appId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The tenant App identity is not configured.',
    })
  }

  return { kind: 'tenant', appId }
}

export async function readUserDirectoryScopeIds(
  scope: UserDirectoryScope,
  limit: number
): Promise<string[]> {
  if (scope.kind !== 'tenant') return []

  const snapshot = await getRuntimeFirestore()
    .collection(AppStorage.collection)
    .doc(scope.appId)
    .collection(AppUserStorage.collection)
    .orderBy(FieldPath.documentId())
    .limit(limit)
    .get()

  return snapshot.docs.map((document) => {
    validateMembership(document)
    return document.id
  })
}

export async function userBelongsToDirectoryScope(
  scope: UserDirectoryScope,
  userId: string
): Promise<boolean> {
  if (scope.kind !== 'tenant') return true
  if (!userId) return false

  const membership = await getRuntimeFirestore()
    .collection(AppStorage.collection)
    .doc(scope.appId)
    .collection(AppUserStorage.collection)
    .doc(userId)
    .get()

  return validateMembership(membership)
}
