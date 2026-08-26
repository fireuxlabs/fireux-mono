// Supplier atomic onboarding binds the root Supplier and its exact Team member.
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
  serverSupplierTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { canonicalCompanyRole } from 'fireux-companies/runtime/place/server/company/canonical'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type {
  SupplierOnboardingAction,
  SupplierOnboardingCompleteResult,
} from '../../models/supplier-onboarding.model.ts'

type MemberRole = 'admin' | 'user'

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
    fail(400, 'Supplier onboarding request must be an object.')
  }

  const source = value as Record<string, unknown>
  const supported = new Set(['supplier_id', 'organization_name', 'company_id'])
  const unsupported = Object.keys(source).find((key) => !supported.has(key))
  if (unsupported) {
    fail(400, `Supplier onboarding contains unsupported field: ${unsupported}.`)
  }
  return source
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  return resolveWorkspaceEntityOnboardingPolicy(event, 'supplier')
}

function memberRole(exists: boolean, value: unknown): MemberRole {
  return requireWorkspaceEntityMemberRole({
    exists,
    role: value,
    entityLabel: 'Supplier',
  })
}

function readRootManagement(value: Record<string, unknown>) {
  if (
    Object.hasOwn(value, 'app_scope') ||
    Object.hasOwn(value, 'app_scope_state') ||
    Object.hasOwn(value, 'app_scope_app_id')
  ) {
    fail(409, 'Supplier contains retired management fields.')
  }
  const management = readFireuxEntityManagement(value.management)
  if (!management) fail(409, 'Supplier management is missing or invalid.')
  return management
}

function resolveAction(input: {
  root: Record<string, unknown> | null
  teamMember: Record<string, unknown> | null
  uid: string
  role: MemberRole
  canCreate: boolean
  appId: string
  ecosystem: string
}): SupplierOnboardingAction {
  if (!input.root) {
    if (!input.canCreate) {
      fail(403, 'Supplier creation is disabled for this App.')
    }
    if (input.role !== 'admin') {
      fail(403, 'An App admin must create the Supplier.')
    }
    return 'create'
  }

  const management = readRootManagement(input.root)
  const managementAppId = resolveFireuxEntityManagementAppId(
    management,
    input.ecosystem
  )
  if (management.mode !== 'root' && managementAppId !== input.appId) {
    fail(409, 'This Supplier is already attached to another App.')
  }
  if (!input.teamMember) {
    if (input.role !== 'admin') {
      fail(403, 'An App admin must connect the Supplier.')
    }
    return 'connect'
  }

  const teamRole = text(input.teamMember.role)
  if (
    text(input.teamMember.user_id) !== input.uid ||
    text(input.teamMember.status) !== 'active' ||
    (teamRole !== 'owner' && teamRole !== 'operator')
  ) {
    fail(403, 'Active Supplier Team membership is required.')
  }
  return 'open'
}

function newSupplierRoot(
  policy: RuntimePolicy,
  uid: string,
  supplierId: string,
  companyId: string
): Record<string, unknown> {
  return {
    management: policy.management,
    company_id: companyId,
    slug: supplierId,
    status: 'active',
    visibility: true,
    catalogue_state: 'directory_only',
    delivery_areas: [],
    created: serverAuditStamp({ by: uid }),
    updated: serverAuditStamp({ by: uid }),
  }
}

export async function completeSupplierOnboarding(
  event: H3Event,
  input: unknown
): Promise<SupplierOnboardingCompleteResult> {
  const body = request(input)
  const { uid } = await requireFirebaseBearerUser(event)
  const policy = runtimePolicy(event)
  const requestedSupplierId = text(body.supplier_id)
  const organizationName = text(body.organization_name)
  const requestedCompanyId = text(body.company_id)
  if (requestedSupplierId && organizationName) {
    fail(400, 'Choose either an existing Supplier or a new organization name.')
  }
  if (!requestedSupplierId && organizationName.length < 2) {
    fail(400, 'Organization name must contain at least 2 characters.')
  }
  if (organizationName.length > 120) {
    fail(400, 'Organization name must contain at most 120 characters.')
  }
  if (requestedSupplierId && requestedCompanyId) {
    fail(400, 'An existing Supplier keeps its stored Company relationship.')
  }
  const newCompanyId = requestedSupplierId
    ? ''
    : requireFirestoreDocumentId(requestedCompanyId, 'Company id')
  const supplierId = requestedSupplierId
    ? requireFirestoreDocumentId(requestedSupplierId, 'Supplier id')
    : requireFirestoreDocumentId(normalizeSlug(organizationName), 'Supplier id')

  const memberships = serverAppUsersTarget(policy.appId)
  const suppliers = FIRESTORE_MUTATION_TARGETS.suppliers
  const team = serverSupplierTeamMembersTarget(supplierId)

  return runGuardedServerTransaction(suppliers.database, async (mutations) => {
    const [membership, root, teamMember] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, uid),
      mutations.read<Record<string, unknown>>(suppliers, supplierId),
      mutations.read<Record<string, unknown>>(team, uid),
    ])
    const role = memberRole(membership.exists, membership.data?.role)
    if (requestedSupplierId && !root.exists) {
      fail(404, 'Supplier not found.')
    }
    if (!requestedSupplierId && root.exists) {
      fail(409, 'A Supplier with this organization name already exists.')
    }
    if (!root.exists && teamMember.exists) {
      fail(409, 'Supplier Team membership exists without its canonical root.')
    }

    const rootData = root.exists ? root.data || {} : null
    const companyId = rootData
      ? requireFirestoreDocumentId(
          rootData.company_id,
          'Stored Supplier Company id'
        )
      : newCompanyId
    const [company, place] = await Promise.all([
      mutations.read<Record<string, unknown>>(
        FIRESTORE_MUTATION_TARGETS.companies,
        companyId
      ),
      mutations.read<Record<string, unknown>>(
        FIRESTORE_MUTATION_TARGETS.places,
        companyId
      ),
    ])
    if (
      !company.exists ||
      !canonicalCompanyRole(companyId, company.data) ||
      !place.exists ||
      !normalizePlace(companyId, place.data || {})
    ) {
      fail(
        409,
        'Supplier onboarding requires a valid Company and same-ID Place.'
      )
    }
    const teamMemberData = teamMember.exists ? teamMember.data || {} : null
    const action = resolveAction({
      root: rootData,
      teamMember: teamMemberData,
      uid,
      role,
      canCreate: policy.canCreate,
      appId: policy.appId,
      ecosystem: policy.ecosystem,
    })
    const createdRoot = !root.exists
    const createdTeamMember = !teamMember.exists

    if (createdRoot) {
      mutations.create(
        suppliers,
        supplierId,
        newSupplierRoot(policy, uid, supplierId, companyId)
      )
    } else {
      const management = readRootManagement(rootData || {})
      if (JSON.stringify(management) !== JSON.stringify(policy.management)) {
        mutations.update(suppliers, supplierId, {
          management: policy.management,
          updated: serverAuditStamp({ by: uid }),
        })
      }
    }

    if (createdTeamMember) {
      mutations.create(team, uid, {
        user_id: uid,
        role: createdRoot ? 'owner' : 'operator',
        permissions: [],
        status: 'active',
        created: serverAuditStamp({ by: uid, appId: policy.appId }),
        updated: serverAuditStamp({ by: uid }),
      })
    }

    return {
      ok: true,
      supplier_id: supplierId,
      action,
      created_root: createdRoot,
      created_team_member: createdTeamMember,
    }
  })
}
