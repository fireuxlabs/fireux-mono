// Concurrent edit — 2026-07-21 22:35 CEST — Console alignment — Property: atomically bind canonical root and App access.
// Concurrent edit — 2026-07-21 23:22 CEST — Console family alignment: reject coerced Property support and membership ids.
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import { hasAppUserPremiumAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  readConsoleEntitySupportAuthority,
  requireConsoleEntityMemberRole,
  resolveConsoleEntityOnboardingPolicy,
} from 'fireux-core/runtime/server/utils/console-entity/onboarding-authority'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppPropertiesTarget,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { canonicalPropertyRoot } from '../../composables/firestore/utils/view/usePropertyInterface.ts'
import type { PropertyOnboardingCompleteResult } from '../../models/property-onboarding.model.ts'
import type {
  Property,
  PropertyCreateInput,
} from '../../models/property.model.ts'
import { buildPropertyCreateRoot } from '../../utils/property-create.ts'

type MemberRole = 'admin' | 'user'

type RuntimePolicy = {
  appId: string
  appRole: string
  developerId: string
  ecosystem: string
  management: Exclude<FireuxEntityManagement, { mode: 'root' }>
  canCreate: boolean
}

type Actor = RuntimePolicy & {
  uid: string
}

const text = (value: unknown) => String(value ?? '').trim()

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
  const unsupported = Object.keys(source).find((key) => !supported.has(key))
  if (unsupported) {
    fail(400, `Property onboarding contains unsupported field: ${unsupported}.`)
  }

  const propertyId = text(source.property_id)
  if (propertyId && Object.keys(source).some((key) => key !== 'property_id')) {
    fail(400, 'Existing Property attachment accepts only property_id.')
  }
  return source
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  return resolveConsoleEntityOnboardingPolicy(event, 'property')
}

function requireMemberRole(exists: boolean, value: unknown): MemberRole {
  return requireConsoleEntityMemberRole({
    exists,
    role: value,
    entityLabel: 'Property',
  })
}

function readSupport(value: Record<string, unknown> | null) {
  return readConsoleEntitySupportAuthority(value, 'Property')
}

async function actor(event: H3Event): Promise<Actor> {
  const { uid } = await requireFirebaseBearerUser(event)
  const policy = runtimePolicy(event)
  return { ...policy, uid }
}

function rootPlan(body: Record<string, unknown>, current: RuntimePolicy) {
  try {
    const plan = buildPropertyCreateRoot(
      body as unknown as PropertyCreateInput,
      current.management
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

  const memberships = serverAppUsersTarget(current.appId)
  const properties = FIRESTORE_MUTATION_TARGETS.properties
  const supports = serverAppPropertiesTarget(current.appId)

  return runGuardedServerTransaction(properties.database, async (mutations) => {
    const membership = await mutations.read<Record<string, unknown>>(
      memberships,
      current.uid
    )
    const role = requireMemberRole(membership.exists, membership.data?.role)
    const membershipData = membership.data || {}
    const [root, support, currentOperatorSupports] = await Promise.all([
      mutations.read<Record<string, unknown>>(properties, propertyId),
      mutations.read<Record<string, unknown>>(supports, propertyId),
      hasAppUserPremiumAccess(membershipData, {
        isConfiguredDeveloper:
          Boolean(current.developerId) && current.uid === current.developerId,
      })
        ? Promise.resolve(null)
        : mutations.query<Record<string, unknown>>(supports, {
            field: 'operator_ids',
            op: 'array-contains',
            value: current.uid,
            limit: 2,
          }),
    ])

    if (currentOperatorSupports) {
      const otherProperty = currentOperatorSupports.find(
        (document) => document.id !== propertyId
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

    const rootData = root.exists ? root.data || {} : null
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
      canonicalRoot.management.mode !== 'root' &&
      resolveFireuxEntityManagementAppId(
        canonicalRoot.management,
        current.ecosystem
      ) !== current.appId
    ) {
      fail(409, 'This Property is already attached to another App.')
    }

    const supportData = support.exists ? support.data || {} : null
    const supportAuthority = readSupport(supportData)
    const isOperator =
      supportAuthority?.operatorIds.includes(current.uid) === true
    const creatingRoot = !root.exists
    const creatingSupport = !support.exists
    const connectingRoot = canonicalRoot?.management.mode === 'root'

    if (creatingRoot && (!current.canCreate || role !== 'admin')) {
      fail(
        403,
        current.canCreate
          ? 'An App admin must create the Property.'
          : 'Property creation is disabled for this App.'
      )
    }
    if (
      !creatingRoot &&
      (creatingSupport || connectingRoot) &&
      role !== 'admin'
    ) {
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
      mutations.create(properties, propertyId, payload)
    } else if (
      canonicalRoot &&
      JSON.stringify(canonicalRoot.management) !==
        JSON.stringify(current.management)
    ) {
      mutations.update(properties, propertyId, {
        management: current.management,
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    if (creatingSupport) {
      mutations.create(supports, propertyId, {
        operator_ids: [current.uid],
        team_ids: [current.uid],
        join_requests: [],
        created: serverAuditStamp({ by: current.uid, appId: current.appId }),
        updated: serverAuditStamp({ by: current.uid }),
      })
    } else {
      mutations.update(supports, propertyId, {
        operator_ids: FieldValue.arrayUnion(current.uid),
        team_ids: FieldValue.arrayUnion(current.uid),
        updated: serverAuditStamp({ by: current.uid }),
      })
    }

    mutations.update(memberships, current.uid, {
      console_enabled: true,
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
