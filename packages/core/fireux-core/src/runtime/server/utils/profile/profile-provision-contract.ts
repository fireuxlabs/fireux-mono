import type { DocumentData } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { serverAuditStamp } from '../records/stamps'
import { profileCollectionForTarget } from '../../../utils/firestore-mutations/targets'

export type ProfileProvisionContractSeed = Readonly<Record<string, unknown>>

export type ProfileProvisionContractDefinition = {
  id: string
  label: string
  root?: {
    collection: string
    seed: () => ProfileProvisionContractSeed
  }
  app: {
    collection: string
    seed: () => ProfileProvisionContractSeed
  }
}

export type ProfileProvisionTransactionOutcome = {
  createdCore: boolean
  createdApp: boolean
}

export const PROFILE_PROVISION_ROOT_ORDER = [
  'agent',
  'chef',
  'driver',
  'professional',
] as const
export const PROFILE_PROVISION_APP_ORDER = [
  'agent',
  'chef',
  'customer',
  'driver',
  'professional',
] as const
const ROOT_PROFILE_IDS: ReadonlySet<string> = new Set(
  PROFILE_PROVISION_ROOT_ORDER
)
const APP_PROFILE_IDS: ReadonlySet<string> = new Set(
  PROFILE_PROVISION_APP_ORDER
)
const RESERVED_SEED_KEYS = new Set([
  'id',
  'user',
  'created',
  'updated',
  'created_at',
  'updated_at',
])

export function failProfileProvision(
  statusCode: number,
  statusMessage: string
): never {
  throw createError({ statusCode, statusMessage })
}

export function requireProfileProvisionSegment(value: unknown, label: string) {
  const segment = String(value ?? '').trim()
  if (!segment || segment.includes('/')) {
    failProfileProvision(500, `${label} is not configured correctly.`)
  }
  return segment
}

export function assertProfileProvisionDefinition(
  definition: ProfileProvisionContractDefinition
) {
  const id = requireProfileProvisionSegment(definition.id, 'Profile id')
  requireProfileProvisionSegment(definition.label, 'Profile label')
  requireProfileProvisionSegment(
    definition.app.collection,
    'App profile collection'
  )

  if (!APP_PROFILE_IDS.has(id)) {
    failProfileProvision(
      500,
      `The ${definition.label} App profile is not supported.`
    )
  }
  if (definition.app.collection !== profileCollectionForTarget('app', id)) {
    failProfileProvision(
      500,
      `${definition.label} App profile collection is not canonical.`
    )
  }
  if (definition.root) {
    requireProfileProvisionSegment(
      definition.root.collection,
      'Root profile collection'
    )
    if (!ROOT_PROFILE_IDS.has(id)) {
      failProfileProvision(
        500,
        `The ${definition.label} root profile is not supported.`
      )
    }
    if (definition.root.collection !== profileCollectionForTarget('root', id)) {
      failProfileProvision(
        500,
        `${definition.label} root profile collection is not canonical.`
      )
    }
  }
}

export function assertProfileProvisionSeed(
  seed: ProfileProvisionContractSeed,
  label: string
): ProfileProvisionContractSeed {
  if (!seed || typeof seed !== 'object' || Array.isArray(seed)) {
    failProfileProvision(500, `${label} did not return an object.`)
  }

  for (const key of Object.keys(seed)) {
    if (RESERVED_SEED_KEYS.has(key)) {
      failProfileProvision(500, `${label} must not supply ${key}.`)
    }
  }

  return seed
}

export function requireProfileProvisionCanonicalUser(snapshot: {
  exists: boolean
}) {
  if (!snapshot.exists) {
    failProfileProvision(
      409,
      'Create the canonical User before creating a profile.'
    )
  }
}

export function requireProfileProvisionAppMembership(snapshot: {
  exists: boolean
  data: DocumentData | undefined
}) {
  if (!snapshot.exists) {
    failProfileProvision(403, 'Join this App before creating an App profile.')
  }

  const data = snapshot.data ?? {}
  if (data.role !== 'user' && data.role !== 'admin') {
    failProfileProvision(409, 'The App membership is invalid.')
  }
}

export function buildRootProfileProvisionData(
  seed: ProfileProvisionContractSeed,
  uid: string
) {
  return {
    ...seed,
    created: serverAuditStamp({ by: uid }),
    updated: serverAuditStamp({ by: uid }),
  }
}

export function buildAppProfileProvisionData(
  seed: ProfileProvisionContractSeed,
  uid: string,
  appId: string
) {
  return {
    ...seed,
    created: serverAuditStamp({ by: uid, appId }),
    updated: serverAuditStamp({ by: uid }),
  }
}
