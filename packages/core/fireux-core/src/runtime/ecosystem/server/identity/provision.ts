import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import { ECOSYSTEM_MUTATION_TARGETS } from '../mutation-targets'

type ProvisionEcosystemInput = {
  uid: string
  identityDatabaseId: string
  ecosystemId: string
  projectId: string
  name: string
  description: string
  checkPrerequisites: () => Promise<void>
}

function requireMatchingProject(value: unknown, projectId: string) {
  if (String(value || '').trim() !== projectId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The existing Ecosystem does not match runtime projectId.',
    })
  }
}

export async function provisionEcosystem(input: ProvisionEcosystemInput) {
  const ecosystemId = requireFirestoreDocumentId(
    input.ecosystemId,
    'Ecosystem id'
  )
  const projectId = requireFirestoreDocumentId(input.projectId, 'Project id')
  const name = String(input.name || '').trim()
  const description = String(input.description || '').trim()

  if (!name || name.length > 120 || description.length > 2000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The main App Ecosystem identity is invalid.',
    })
  }

  const database = getRuntimeIdentityFirestore(input.identityDatabaseId)
  const existing = await database.collection('ecosystems').doc(ecosystemId).get()
  if (existing.exists) {
    requireMatchingProject(existing.get('project_id'), projectId)
    return false
  }

  await input.checkPrerequisites()

  return runGuardedServerTransaction({ kind: 'identity' }, async (mutations) => {
    const target = ECOSYSTEM_MUTATION_TARGETS.ecosystems
    const ecosystem = await mutations.read(target, ecosystemId)
    if (ecosystem.exists) {
      requireMatchingProject(ecosystem.data?.project_id, projectId)
      return false
    }

    const now = FieldValue.serverTimestamp()
    mutations.create(target, ecosystemId, {
      project_id: projectId,
      status: 'active',
      name,
      description,
      image_url: '',
      created: { at: now, by: input.uid },
      updated: { at: now, by: input.uid },
    })
    return true
  })
}
