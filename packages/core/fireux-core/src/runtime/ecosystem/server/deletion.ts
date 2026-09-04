import { createError, type H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { DeletionImpact } from '../../models/utils/deletion.model'
import { requireDevDeveloper } from '../../server/utils/auth/developer'
import { getRuntimeIdentityFirestore } from '../../server/utils/getRuntimeFirestore'
import { countDocumentDescendants, deleteDocumentTree } from '../../server/utils/deletion/document-tree'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'

function identityDatabaseId(event: H3Event) {
  const firebase = useRuntimeConfig(event).public?.firebaseEcosystem?.firebase as Record<string, unknown> | undefined
  return String(firebase?.identityDatabaseId || firebase?.databaseId || '').trim()
}

export async function readEcosystemDeletionImpact(event: H3Event): Promise<DeletionImpact> {
  await requireDevDeveloper(event)
  const ecosystemId = String(useFireUXConfig(event).ecosystemId || '').trim()
  if (!ecosystemId) return { canDelete: false, blockers: ['This App has no configured Ecosystem.'], effects: [] }
  const db = getRuntimeIdentityFirestore(identityDatabaseId(event))
  const root = db.collection('ecosystems').doc(ecosystemId)
  if (!(await root.get()).exists) return { canDelete: false, blockers: ['Ecosystem does not exist.'], effects: [] }
  const appCount = (await root.collection('apps').count().get()).data().count
  const descendants = await countDocumentDescendants(root)
  const blockers = appCount ? [`Delete or detach ${appCount} App${appCount === 1 ? '' : 's'} first.`] : []
  return {
    canDelete: blockers.length === 0,
    blockers,
    effects: [
      `Delete the Ecosystem and ${descendants} owned descendant document${descendants === 1 ? '' : 's'}.`,
      'Keep Firebase projects, databases, Auth, Storage, Hosting, and Functions unchanged.',
    ],
  }
}

export async function executeEcosystemDeletion(event: H3Event) {
  const impact = await readEcosystemDeletionImpact(event)
  if (!impact.canDelete) throw createError({ statusCode: 409, statusMessage: impact.blockers.join(' ') })
  const ecosystemId = String(useFireUXConfig(event).ecosystemId || '').trim()
  const db = getRuntimeIdentityFirestore(identityDatabaseId(event))
  await deleteDocumentTree(db, db.collection('ecosystems').doc(ecosystemId))
  return { ok: true, ecosystemId }
}
