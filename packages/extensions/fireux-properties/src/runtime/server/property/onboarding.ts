// Concurrent edit — 2026-07-21 22:35 CEST — Console alignment — Property: atomically bind canonical root, App access, and UserApp target.
// Concurrent edit — 2026-07-21 23:22 CEST — Console family alignment: reject coerced Property support and membership ids.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import {
  resolveFireuxAppScopeStateForRole,
  type FireuxAppScopeState,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import { UserAppStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import { hasUserAppPremiumAccess } from 'fireux-core/runtime/models/core/supporting/user-app-access.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import { canonicalPropertyRoot } from '../../composables/fireux/firestore/property/utils/view/usePropertyInterface.ts'
import type { PropertyOnboardingCompleteResult } from '../../models/property-onboarding.model.ts'
import {
  PropertyStorage,
  type Property,
  type PropertyCreateInput,
} from '../../models/property.model.ts'
import { buildPropertyCreateRoot } from '../../utils/property-create.ts'

type Firestore = ReturnType<typeof getRuntimeFirestore>
type MemberRole = 'admin' | 'user'

type RuntimePolicy = {
  appId: string
  appRole: string
  developerId: string
  appScopeState: Exclude<FireuxAppScopeState, 'root_only'>
  canCreate: boolean
  targetIds: string[]
}

type Actor = RuntimePolicy & {
  uid: string
  db: Firestore
  membershipRef: ReturnType<Firestore['doc']>
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function request(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Property onboarding request must be an object.')
  }
  const source = value as Record<string, unknown>
  const supported = new Set([
    'property_id',
    'id',
    'slug',
    'portfolio_id',
    'place_id',
    'identity',
    'status',
  ])
  const unsupported = Object.keys(source).find(key => !supported.has(key))
  if (unsupported) {
    fail(400, `Property onboarding contains unsupported field: ${unsupported}.`)
  }

  const propertyId = text(source.property_id)
  if (propertyId && Object.keys(source).some(key => key !== 'property_id')) {
    fail(400, 'Existing Property attachment accepts only property_id.')
  }
  return source
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  const fireux = record(useRuntimeConfig(event).public?.fireux)
  const appId = requireFirestoreDocumentId(fireux.id, 'Runtime App id')
  const appRole = text(fireux.role)
  const developerId = text(fireux.developerId)
  const appScopeState = resolveFireuxAppScopeStateForRole(appRole)
  if (!appScopeState) fail(403, 'This App cannot own a Property console.')

  const propertyConfig = record(record(fireux.consoleConfig).property)
  const canCreate = typeof propertyConfig.canCreate === 'boolean'
    ? propertyConfig.canCreate
    : appRole !== 'tenant'
  const targetIds = Array.isArray(propertyConfig.targetIds)
    ? Array.from(new Set(propertyConfig.targetIds.map(text).filter(Boolean)))
    : []

  return {
    appId,
    appRole,
    developerId,
    appScopeState,
    canCreate,
    targetIds,
  }
}

function requireMemberRole(exists: boolean, value: unknown): MemberRole {
  const role = text(value)
  if (!exists || (role !== 'admin' && role !== 'user')) {
    fail(403, 'Current App membership is required to onboard a Property.')
  }
  return role
}

function assertRuntimeTarget(current: RuntimePolicy, propertyId: string) {
  if (current.appRole !== 'tenant') return
  if (!current.targetIds.includes(propertyId)) {
    fail(403, 'This Property is not a configured target for the tenant App.')
  }
}

function boundedIds(value: unknown, max: number, label: string) {
  if (!Array.isArray(value) || value.length > max) {
    fail(409, `${label} has an invalid stored shape.`)
  }
  if (value.some(id => typeof id !== 'string')) {
    fail(409, `${label} has invalid stored ids.`)
  }
  const ids = (value as string[]).map(id => id.trim())
  if (
    ids.some((id, index) => !id || id !== value[index]) ||
    new Set(ids).size !== ids.length
  ) {
    fail(409, `${label} has invalid stored ids.`)
  }
  return ids
}

function readSupport(value: Record<string, unknown> | null) {
  if (!value) return null
  return {
    operatorIds: boundedIds(value.operator_ids, 50, 'Property operators'),
    teamIds: boundedIds(value.team_ids, 100, 'Property team'),
    joinRequests: boundedIds(
      value.join_requests,
      100,
      'Property join requests'
    ),
  }
}

function assertMembershipTargets(value: Record<string, unknown>, propertyId: string) {
  const targets = record(value.console_targets)
  if (targets.property_ids === undefined) return
  const ids = boundedIds(
    targets.property_ids,
    50,
    'UserApp Property console targets'
  )
  if (!ids.includes(propertyId) && ids.length >= 50) {
    fail(409, 'The UserApp Property console target list is full.')
  }
}

async function actor(event: H3Event): Promise<Actor> {
  const { uid } = await requireFirebaseBearerUser(event)
  const policy = runtimePolicy(event)
  const db = getRuntimeFirestore()
  return {
    ...policy,
    uid,
    db,
    membershipRef: db.doc(
      `apps/${policy.appId}/${UserAppStorage.collection}/${uid}`
    ),
  }
}

function rootPlan(body: Record<string, unknown>, current: RuntimePolicy) {
  try {
    const plan = buildPropertyCreateRoot(
      body as unknown as PropertyCreateInput,
      {
        app_scope_state: current.appScopeState,
        app_scope_app_id: current.appId,
      }
    )
    return {
      ...plan,
      id: requireFirestoreDocumentId(plan.id, 'Property id'),
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    fail(
      400,
      error instanceof Error
        ? error.message
        : 'Property creation input is invalid.'
    )
  }
}

export async function completePropertyOnboarding(
  event: H3Event,
  input: unknown
): Promise<PropertyOnboardingCompleteResult> {
  const body = request(input)
  const current = await actor(event)
  const requestedPropertyId = text(body.property_id)
  const plan = requestedPropertyId ? null : rootPlan(body, current)
  const propertyId = requestedPropertyId
    ? requireFirestoreDocumentId(requestedPropertyId, 'Property id')
    : plan!.id
  assertRuntimeTarget(current, propertyId)

  const rootRef = current.db
    .collection(PropertyStorage.rootCollection)
    .doc(propertyId)
  const supportRef = current.db.doc(
    `apps/${current.appId}/${PropertyStorage.appSupportCollection}/${propertyId}`
  )
  const operatorQuery = current.db
    .collection(
      `apps/${current.appId}/${PropertyStorage.appSupportCollection}`
    )
    .where('operator_ids', 'array-contains', current.uid)
    .limit(2)

  return current.db.runTransaction(async transaction => {
    const membership = await transaction.get(current.membershipRef)
    const role = requireMemberRole(membership.exists, membership.get('role'))
    const membershipData = membership.data() || {}
    assertMembershipTargets(membershipData, propertyId)

    const [root, support, currentOperatorSupports] = await Promise.all([
      transaction.get(rootRef),
      transaction.get(supportRef),
      hasUserAppPremiumAccess(membershipData, {
        isConfiguredDeveloper:
          Boolean(current.developerId) &&
          current.uid === current.developerId,
      })
        ? Promise.resolve(null)
        : transaction.get(operatorQuery),
    ])

    if (currentOperatorSupports) {
      const otherProperty = currentOperatorSupports.docs.find(
        document => document.id !== propertyId
      )
      if (otherProperty) {
        fail(
          403,
          'Standard users can only be on one live property team per App. Premium unlocks multiple.'
        )
      }
    }

    if (!root.exists && requestedPropertyId) {
      fail(404, 'Property not found.')
    }
    if (!root.exists && support.exists) {
      fail(409, 'Property access exists without its canonical root.')
    }

    const rootData = root.exists ? root.data() || {} : null
    const canonicalRoot = rootData
      ? canonicalPropertyRoot({
          ...(rootData as Property),
          id: propertyId,
        })
      : null
    if (rootData && (!canonicalRoot || canonicalRoot.id !== propertyId)) {
      fail(409, `Existing Property root is schema-invalid: ${propertyId}`)
    }
    if (
      canonicalRoot &&
      canonicalRoot.app_scope_state !== 'root_only' &&
      canonicalRoot.app_scope_app_id !== current.appId
    ) {
      fail(409, 'This Property is already attached to another App.')
    }

    const supportData = support.exists ? support.data() || {} : null
    const supportAuthority = readSupport(supportData)
    const isOperator = supportAuthority?.operatorIds.includes(current.uid) === true
    const creatingRoot = !root.exists
    const creatingSupport = !support.exists
    const connectingRoot = canonicalRoot?.app_scope_state === 'root_only'

    if (creatingRoot && (!current.canCreate || role !== 'admin')) {
      fail(
        403,
        current.canCreate
          ? 'An App admin must create the Property.'
          : 'Property creation is disabled for this App.'
      )
    }
    if (!creatingRoot && (creatingSupport || connectingRoot) && role !== 'admin') {
      fail(403, 'An App admin must connect this Property.')
    }
    if (!creatingSupport && role !== 'admin' && !isOperator) {
      fail(403, 'An App admin or existing Property operator must grant access.')
    }
    if (
      supportAuthority &&
      !supportAuthority.operatorIds.includes(current.uid) &&
      supportAuthority.operatorIds.length >= 50
    ) {
      fail(409, 'The Property operator list is full.')
    }
    if (
      supportAuthority &&
      !supportAuthority.teamIds.includes(current.uid) &&
      supportAuthority.teamIds.length >= 100
    ) {
      fail(409, 'The Property team list is full.')
    }

    if (creatingRoot) {
      if (!plan) fail(409, 'Property creation input changed during onboarding.')
      const payload = {
        ...plan.payload,
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      }
      const canonicalPayload = canonicalPropertyRoot({
        ...(payload as unknown as Property),
        id: propertyId,
      })
      if (!canonicalPayload || canonicalPayload.id !== propertyId) {
        fail(500, 'Canonical Property creation produced an invalid root.')
      }
      transaction.create(rootRef, payload)
    } else if (
      canonicalRoot &&
      (
        canonicalRoot.app_scope_state !== current.appScopeState ||
        canonicalRoot.app_scope_app_id !== current.appId
      )
    ) {
      transaction.update(rootRef, {
        app_scope_state: current.appScopeState,
        app_scope_app_id: current.appId,
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    if (creatingSupport) {
      transaction.create(supportRef, {
        operator_ids: [current.uid],
        team_ids: [current.uid],
        join_requests: [],
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      transaction.update(supportRef, {
        operator_ids: FieldValue.arrayUnion(current.uid),
        team_ids: FieldValue.arrayUnion(current.uid),
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    transaction.update(current.membershipRef, {
      console_enabled: true,
      'console_targets.property_ids': FieldValue.arrayUnion(propertyId),
      updated: serverAuditStamp({ by: current.uid }),
    })

    return {
      ok: true,
      property_id: propertyId,
      created_root: creatingRoot,
      created_app_support: creatingSupport,
    }
  })
}
