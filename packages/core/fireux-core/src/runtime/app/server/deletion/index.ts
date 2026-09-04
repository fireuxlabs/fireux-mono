import { createError, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { DeletionImpact } from '../../../models/utils/deletion.model'
import { getRuntimeFirestore, getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { countDocumentDescendants, deleteDocumentTree } from '../../../server/utils/deletion/document-tree'
import { requireDevDeveloper } from '../../../server/utils/auth/developer'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'

function databases(event: H3Event) {
  const firebase = useRuntimeConfig(event).public?.firebaseEcosystem?.firebase as Record<string, unknown> | undefined
  const appDatabaseId = String(firebase?.databaseId || '').trim()
  return {
    appDatabaseId,
    identityDatabaseId: String(firebase?.identityDatabaseId || appDatabaseId).trim(),
  }
}

export async function readAppDeletionImpact(event: H3Event): Promise<DeletionImpact> {
  await requireDevDeveloper(event)
  const config = useFireUXConfig(event)
  const { appDatabaseId } = databases(event)
  const root = getRuntimeFirestore(appDatabaseId).collection('apps').doc(config.appId)
  if (!(await root.get()).exists) return { canDelete: false, blockers: ['App does not exist.'], effects: [] }
  const descendants = await countDocumentDescendants(root)
  return {
    canDelete: true,
    blockers: [],
    effects: [
      `Delete App ${config.appId}.`,
      `Delete ${descendants} App-owned descendant document${descendants === 1 ? '' : 's'}.`,
      'Remove its User and Ecosystem locators.',
      'Keep Firebase projects, databases, Auth, Storage, Hosting, and Functions unchanged.',
    ],
  }
}

export async function executeAppDeletion(event: H3Event) {
  const impact = await readAppDeletionImpact(event)
  if (!impact.canDelete) throw createError({ statusCode: 409, statusMessage: impact.blockers.join(' ') })
  const config = useFireUXConfig(event)
  const { appDatabaseId, identityDatabaseId } = databases(event)
  const db = getRuntimeFirestore(appDatabaseId)
  const identity = getRuntimeIdentityFirestore(identityDatabaseId)
  const root = db.collection('apps').doc(config.appId)
  const snapshot = await root.get()
  const memberships = await root.collection('users').listDocuments()
  for (const membership of memberships) {
    await identity.collection('users').doc(membership.id).collection('apps').doc(config.appId).delete()
  }
  const ecosystemId = String(snapshot.get('ecosystem_id') || '').trim()
  if (ecosystemId) await identity.collection('ecosystems').doc(ecosystemId).collection('apps').doc(config.appId).delete()
  await deleteDocumentTree(db, root)
  return { ok: true, appId: config.appId }
}
