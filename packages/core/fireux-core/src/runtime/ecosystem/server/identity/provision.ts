import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'
import { ECOSYSTEM_MUTATION_TARGETS } from '../mutation-targets'
import { canonicalEcosystem } from './read'

type ProvisionEcosystemInput = {
  uid: string
  ecosystemId: string
  projectId?: string
  name: string
  description: string
  /** The trusted caller must verify actor authority and prerequisites for this target. */
  checkPrerequisites: () => Promise<void>
}

/** Provision a root in the runtime identity database using trusted server inputs. */
export async function provisionEcosystem(input: ProvisionEcosystemInput) {
  const uid = requireFirestoreDocumentId(input.uid, 'Actor id')
  const ecosystemId = requireFirestoreDocumentId(
    input.ecosystemId,
    'Ecosystem id'
  )
  const projectId =
    input.projectId === undefined
      ? undefined
      : requireFirestoreDocumentId(input.projectId, 'Project id')
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const description =
    typeof input.description === 'string' ? input.description.trim() : null

  if (
    !name ||
    name.length > 120 ||
    description === null ||
    description.length > 2000
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The Ecosystem identity is invalid.',
    })
  }

  if (typeof input.checkPrerequisites !== 'function') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Trusted Ecosystem provisioning authority is required.',
    })
  }

  await input.checkPrerequisites()

  return runGuardedServerTransaction(
    { kind: 'identity' },
    async (mutations) => {
      const target = ECOSYSTEM_MUTATION_TARGETS.ecosystems
      const ecosystem = await mutations.read(target, ecosystemId)
      if (ecosystem.exists) {
        const existing = canonicalEcosystem(ecosystemId, ecosystem.data, false)
        if (
          !existing ||
          existing.name.length > 120 ||
          (existing.description?.length ?? 0) > 2000 ||
          (ecosystem.data?.description !== undefined &&
            existing.description === undefined)
        ) {
          throw createError({
            statusCode: 409,
            statusMessage: 'The existing Ecosystem identity is invalid.',
          })
        }
        if (existing.project_id !== projectId) {
          throw createError({
            statusCode: 409,
            statusMessage:
              'The existing Ecosystem does not match runtime projectId.',
          })
        }
        // The linked Main App configuration seeds copy once. Standalone callers
        // must agree on the identity they are provisioning.
        if (
          projectId === undefined &&
          (existing.name !== name ||
            (existing.description ?? '') !== description)
        ) {
          throw createError({
            statusCode: 409,
            statusMessage:
              'The existing Ecosystem identity differs from the request.',
          })
        }
        return false
      }

      const now = FieldValue.serverTimestamp()
      mutations.create(target, ecosystemId, {
        ...(projectId !== undefined ? { project_id: projectId } : {}),
        status: 'active',
        name,
        description,
        image_url: '',
        created: { at: now, by: uid },
        updated: { at: now, by: uid },
      })
      return true
    }
  )
}
