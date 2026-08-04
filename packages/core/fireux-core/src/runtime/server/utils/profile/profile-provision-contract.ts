import {
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase-admin/firestore'
import { createError } from 'h3'
import { canonicalProfileIndex } from '../../../models/operations/profile-provisioning'
import { serverAuditStamp } from '../records/stamps'

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

function assertProfileList(
  value: unknown,
  order: readonly string[],
  label: string
): string[] {
  const allowed = new Set(order)
  if (
    !Array.isArray(value) ||
    value.length > 20 ||
    value.some((entry) => typeof entry !== 'string' || !allowed.has(entry)) ||
    new Set(value).size !== value.length
  ) {
    failProfileProvision(409, `${label} has an invalid profile index.`)
  }
  const canonical = canonicalProfileIndex(value, order)
  if (canonical.some((profileId, index) => value[index] !== profileId)) {
    failProfileProvision(
      409,
      `${label} profile index is not in canonical order.`
    )
  }
  return value
}

export function requireProfileProvisionCanonicalUser(
  snapshot: DocumentSnapshot
) {
  if (!snapshot.exists) {
    failProfileProvision(
      409,
      'Create the canonical User before creating a profile.'
    )
  }
  return assertProfileList(
    snapshot.data()?.profiles,
    PROFILE_PROVISION_ROOT_ORDER,
    'The canonical User'
  )
}

export function requireProfileProvisionAppMembership(
  snapshot: DocumentSnapshot
) {
  if (!snapshot.exists) {
    failProfileProvision(403, 'Join this App before creating an App profile.')
  }

  const data = snapshot.data() as DocumentData
  if (data.role !== 'user' && data.role !== 'admin') {
    failProfileProvision(409, 'The App membership is invalid.')
  }

  return assertProfileList(
    data.profiles ?? [],
    PROFILE_PROVISION_APP_ORDER,
    'The App membership'
  )
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
