import type { DocumentData } from 'firebase-admin/firestore'
import { createError } from 'h3'
import type { UserProfileKind } from '../../../utils/firestore-mutations/targets'
import { USER_PROFILE_KINDS } from '../../../utils/firestore-mutations/targets'
import { serverAuditStamp } from '../records/stamps'

export type ProfileProvisionContractSeed = Readonly<Record<string, unknown>>

export type ProfileProvisionContractDefinition = {
  kind: UserProfileKind
  label: string
  profile: {
    seed: () => ProfileProvisionContractSeed
  }
  appState?: {
    seed: () => ProfileProvisionContractSeed
  }
}

export type ProfileProvisionTransactionOutcome = {
  createdProfile: boolean
  createdAppState: boolean
}

const PROFILE_KINDS: ReadonlySet<string> = new Set(USER_PROFILE_KINDS)
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
  const kind = requireProfileProvisionSegment(definition.kind, 'Profile kind')
  requireProfileProvisionSegment(definition.label, 'Profile label')
  if (!PROFILE_KINDS.has(kind)) {
    failProfileProvision(500, `${definition.label} profile is not supported.`)
  }
  if (typeof definition.profile?.seed !== 'function') {
    failProfileProvision(500, `${definition.label} profile seed is missing.`)
  }
  if (definition.appState && typeof definition.appState.seed !== 'function') {
    failProfileProvision(500, `${definition.label} App-state seed is missing.`)
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
    failProfileProvision(403, 'Join this App before creating a profile.')
  }

  const data = snapshot.data ?? {}
  if (data.role !== 'user' && data.role !== 'admin') {
    failProfileProvision(409, 'The App membership is invalid.')
  }
}

export function buildProfileProvisionData(
  seed: ProfileProvisionContractSeed,
  uid: string,
  kind: UserProfileKind
) {
  return {
    ...seed,
    kind,
    created: serverAuditStamp({ by: uid }),
    updated: serverAuditStamp({ by: uid }),
  }
}

export function buildProfileAppStateProvisionData(
  seed: ProfileProvisionContractSeed,
  uid: string,
  appId: string,
  kind: UserProfileKind
) {
  return {
    ...seed,
    profile_kind: kind,
    app_id: appId,
    created: serverAuditStamp({ by: uid, appId }),
    updated: serverAuditStamp({ by: uid }),
  }
}
