import {
  createMembershipAccess,
  readMembershipAccessIds,
} from 'fireux-core/runtime/app/utils/membership-access'
import { serverPropertyAccessTarget } from '../../utils/access'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { createError, type H3Event } from 'h3'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  requireWorkspaceEntityMemberRole,
  resolveWorkspaceEntityOnboardingPolicy,
} from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverPropertyTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { canonicalPropertyRoot } from '../../composables/firestore/utils/view/usePropertyInterface.ts'
import type { PropertyOnboardingCompleteResult } from '../../models/property-onboarding.model.ts'
import type {
  Property,
  PropertyCreateInput,
} from '../../models/property.model.ts'
import { buildPropertyCreateRoot } from '../../utils/property-create.ts'

type MemberRole = 'admin' | 'user' | 'dev'

type RuntimePolicy = {
  appId: string
  ecosystem: string
  management: Exclude<FireuxEntityManagement, { mode: 'root' }>
  canCreate: boolean
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
    'portfolio_id',
    'place_id',
    'identity',
  ])
  const unsupported = Object.keys(source).find((key) => !supported.has(key))
  if (unsupported) {
    fail(400, `Property onboarding contains unsupported field: ${unsupported}.`)
  }
  if (
    source.property_id !== undefined &&
    typeof source.property_id !== 'string'
  ) {
    fail(400, 'Property id must be a string.')
  }
  const propertyId = text(source.property_id)
  if (propertyId && Object.keys(source).some((key) => key !== 'property_id')) {
    fail(400, 'Existing Property attachment accepts only property_id.')
  }
  return source
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  return resolveWorkspaceEntityOnboardingPolicy(event, 'property')
}

function memberRole(exists: boolean, value: unknown): MemberRole {
  return requireWorkspaceEntityMemberRole({
    exists,
    role: value,
    entityLabel: 'Property',
  })
}

function rootManagement(root: Record<string, unknown>) {
  const management = readFireuxEntityManagement(root.management)
  if (!management) fail(409, 'Property management is missing or invalid.')
  return management
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
  const { uid, decoded } = await requireFirebaseBearerUser(event)
  const current = runtimePolicy(event)
  const subscriptionCapacity = useFireUXConfig(event).subscriptionCapacity
  const requestedPropertyId = text(body.property_id)
  const plan = requestedPropertyId ? null : rootPlan(body, current)
  const propertyId = requestedPropertyId
    ? requireFirestoreDocumentId(requestedPropertyId, 'Property id')
    : plan!.id

  const memberships = serverAppUsersTarget(current.appId)
  const grants = serverPropertyAccessTarget(current.appId)
  const properties = FIRESTORE_MUTATION_TARGETS.properties
  const team = serverPropertyTeamMembersTarget(propertyId)

  return runGuardedServerTransaction(properties.database, async (mutations) => {
    const [membership, root, teamMember, accessRecord] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, uid),
      mutations.read<Record<string, unknown>>(properties, propertyId),
      mutations.read<Record<string, unknown>>(team, uid),
      mutations.read<Record<string, unknown>>(grants, uid),
    ])
    const role = memberRole(membership.exists, membership.data?.role)
    if (requestedPropertyId && !root.exists) fail(404, 'Property not found.')
    if (!requestedPropertyId && root.exists) {
      fail(409, 'A Property with this id already exists.')
    }
    if (!root.exists && teamMember.exists) {
      fail(409, 'Property Team membership exists without its canonical root.')
    }

    const rootData = root.exists ? root.data || {} : null
    const canonicalRoot = rootData
      ? canonicalPropertyRoot({ ...(rootData as Property), id: propertyId })
      : null
    if (rootData && (!canonicalRoot || canonicalRoot.id !== propertyId)) {
      fail(409, `Existing Property root is schema-invalid: ${propertyId}`)
    }
    if (rootData) {
      const management = rootManagement(rootData)
      if (
        management.mode !== 'root' &&
        resolveFireuxEntityManagementAppId(management, current.ecosystem) !==
          current.appId
      ) {
        fail(409, 'This Property is already attached to another App.')
      }
    }

    const creatingRoot = !root.exists
    const creatingTeamMember = !teamMember.exists
    const propertyIds = readMembershipAccessIds(
      accessRecord.data,
      membership.data
    )
    const associated = propertyIds.includes(propertyId)
    const access = resolveAppUserAccess(membership.data)
    if (!access.hasMembership)
      fail(409, 'Current App membership has an invalid subscription.')
    if (creatingRoot && !current.canCreate)
      fail(403, 'Property creation is disabled for this App.')
    if (!creatingRoot && !associated && role !== 'admin' && role !== 'dev')
      fail(403, 'An App admin must connect the Property.')
    if (
      !associated &&
      !hasAppSubscriptionCapacity(
        subscriptionCapacity,
        'property',
        access.subscription,
        propertyIds.length
      )
    )
      fail(403, 'Your subscription has no Property places available.')

    if (creatingRoot) {
      if (!plan) fail(409, 'Property creation input changed during onboarding.')
      const payload = {
        ...plan.payload,
        created: serverAuditStamp({ by: uid, appId: current.appId }),
        updated: serverAuditStamp({ by: uid }),
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
        updated: serverAuditStamp({ by: uid }),
      })
    }

    if (creatingTeamMember) {
      mutations.create(team, uid, {
        name: text(decoded.name) || text(decoded.email) || 'Team member',
        user_id: uid,
        role_ids: [],
      })
    }
    const nextAccess = createMembershipAccess(
      [...new Set([...propertyIds, propertyId])],
      membership.data
    )
    if (accessRecord.exists) mutations.update(grants, uid, nextAccess)
    else mutations.create(grants, uid, nextAccess)

    return {
      ok: true,
      property_id: propertyId,
      created_root: creatingRoot,
      created_team_member: creatingTeamMember,
    }
  })
}
