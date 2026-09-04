import { createError, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { DeletionImpact } from '../../models/utils/deletion.model'
import { requireFirebaseBearerUser } from '../../server/utils/auth/bearer'
import { getRuntimeIdentityFirestore } from '../../server/utils/getRuntimeFirestore'
import { countDocumentDescendants, deleteDocumentTree } from '../../server/utils/deletion/document-tree'

function identityDatabaseId(event: H3Event) {
  const firebase = useRuntimeConfig(event).public?.firebaseEcosystem?.firebase as Record<string, unknown> | undefined
  return String(firebase?.identityDatabaseId || firebase?.databaseId || '').trim()
}

export async function readUserDeletionImpact(event: H3Event): Promise<DeletionImpact> {
  const { uid } = await requireFirebaseBearerUser(event)
  const db = getRuntimeIdentityFirestore(identityDatabaseId(event))
  const root = db.collection('users').doc(uid)
  if (!(await root.get()).exists) return { canDelete: false, blockers: ['User does not exist.'], effects: [] }
  const appCount = (await root.collection('apps').count().get()).data().count
  const descendants = await countDocumentDescendants(root)
  const blockers = appCount ? [`Remove ${appCount} App membership${appCount === 1 ? '' : 's'} first.`] : []
  return {
    canDelete: blockers.length === 0,
    blockers,
    effects: [
      `Delete the User and ${descendants} User-owned descendant document${descendants === 1 ? '' : 's'}.`,
      'Keep the Firebase Auth account unchanged.',
    ],
  }
}

export async function executeUserDeletion(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const impact = await readUserDeletionImpact(event)
  if (!impact.canDelete) throw createError({ statusCode: 409, statusMessage: impact.blockers.join(' ') })
  const db = getRuntimeIdentityFirestore(identityDatabaseId(event))
  await deleteDocumentTree(db, db.collection('users').doc(uid))
  return { ok: true, userId: uid, authDeleted: false }
}
