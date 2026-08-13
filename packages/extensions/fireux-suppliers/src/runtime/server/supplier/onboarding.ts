// Concurrent edit — 2026-07-21 22:34 CEST — Supplier atomic onboarding: bind root and App support in one trusted transaction.
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
  resolveFireuxEntityManagementForApp,
} from 'fireux-core/runtime/utils/entity-management'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import { resolveConsoleCanCreate } from 'fireux-core/runtime/utils/console-policy'
import { hasAppUserPremiumAccess } from 'fireux-core/runtime/utils/app-user-access'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppSuppliersTarget,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { canonicalCompanyRole } from 'fireux-companies/runtime/server/company/canonical'
import { projectPublicPlace } from 'fireux-places/runtime/server/place/public-projection'
import type {
  SupplierOnboardingAction,
  SupplierOnboardingCompleteResult,
} from '../../models/supplier/supplier-onboarding.model.ts'

type MemberRole = 'admin' | 'user'

type RuntimePolicy = {
  appId: string
  appRole: string
  developerId: string
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
  const fireux = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(fireux.appId, 'Runtime App id')
  const appRole = fireux.role
  const developerId = fireux.developerId || ''
  const ecosystem = requireFirestoreDocumentId(
    fireux.ecosystem,
    'Ecosystem key'
  )
  const management = resolveFireuxEntityManagementForApp(
    appRole,
    appId,
    ecosystem
  )

  const canCreate = resolveConsoleCanCreate(
    appRole,
    fireux.consoleConfig,
    'supplier'
  )
  return {
    appId,
    appRole,
    developerId,
    ecosystem,
    management,
    canCreate,
  }
}

function memberRole(exists: boolean, value: unknown): MemberRole {
  const role = text(value)
  if (!exists || (role !== 'admin' && role !== 'user')) {
    fail(403, 'Current App membership is required to onboard a Supplier.')
  }
  return role
}

function boundedIds(value: unknown, max: number, label: string) {
  if (!Array.isArray(value) || value.length > max) {
    fail(409, `${label} has an invalid stored shape.`)
  }

  if (value.some((id) => typeof id !== 'string')) {
    fail(409, `${label} has invalid stored ids.`)
  }
  const ids = (value as string[]).map((id) => id.trim())
  if (
    ids.some((id, index) => !id || id !== value[index]) ||
    new Set(ids).size !== ids.length
  ) {
    fail(409, `${label} has invalid stored ids.`)
  }
  return ids
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

function readSupport(value: Record<string, unknown>) {
  return {
    operatorIds: boundedIds(value.operator_ids, 50, 'Supplier operators'),
    teamIds: boundedIds(value.team_ids, 100, 'Supplier team'),
    joinRequests: boundedIds(
      value.join_requests,
      100,
      'Supplier join requests'
    ),
  }
}

function assertSupportCapacity(
  support: ReturnType<typeof readSupport>,
  uid: string
) {
  if (!support.operatorIds.includes(uid) && support.operatorIds.length >= 50) {
    fail(409, 'The Supplier operator list is full.')
  }
  if (!support.teamIds.includes(uid) && support.teamIds.length >= 100) {
    fail(409, 'The Supplier team list is full.')
  }
}

function resolveAction(input: {
  root: Record<string, unknown> | null
  support: ReturnType<typeof readSupport> | null
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
  if (management.mode === 'root' && input.support) {
    fail(409, 'Supplier access exists for an unattached canonical root.')
  }

  if (!input.support) {
    if (input.role !== 'admin') {
      fail(403, 'An App admin must connect the Supplier.')
    }
    return 'connect'
  }

  if (
    input.role !== 'admin' &&
    !input.support.operatorIds.includes(input.uid) &&
    !input.support.teamIds.includes(input.uid)
  ) {
    fail(403, 'An App admin or existing Supplier operator must grant access.')
  }
  return 'open'
}

function newSupplierRoot(
  policy: RuntimePolicy,
  uid: string,
  supplierId: string,
  organizationName: string,
  companyId: string
): Record<string, unknown> {
  return {
    management: policy.management,
    company_id: companyId,
    slug: supplierId,
    supplier_organization_name: organizationName,
    tagline: '',
    supplier_headline: '',
    summary: '',
    supplier_bio: '',
    supplier_image: '',
    supplier_item_categories: [],
    supplier_delivery_areas: [],
    state: 'public',
    catalogue_state: 'public_only',
    linked_ingredient_ids: [],
    hello: '',
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
  const supports = serverAppSuppliersTarget(policy.appId)

  return runGuardedServerTransaction(suppliers.database, async (mutations) => {
    const [membership, root, support] = await Promise.all([
      mutations.read<Record<string, unknown>>(memberships, uid),
      mutations.read<Record<string, unknown>>(suppliers, supplierId),
      mutations.read<Record<string, unknown>>(supports, supplierId),
    ])
    const role = memberRole(membership.exists, membership.data?.role)
    const membershipData = membership.data || {}
    if (requestedSupplierId && !root.exists) {
      fail(404, 'Supplier not found.')
    }
    if (!requestedSupplierId && root.exists) {
      fail(409, 'A Supplier with this organization name already exists.')
    }
    if (!root.exists && support.exists) {
      fail(409, 'Supplier access exists without its canonical root.')
    }

    const rootData = root.exists ? root.data || {} : null
    const companyId = rootData
      ? requireFirestoreDocumentId(rootData.company_id, 'Stored Supplier Company id')
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
      !projectPublicPlace(companyId, place.data || {})
    ) {
      fail(409, 'Supplier onboarding requires a valid Company and same-ID Place.')
    }
    const supportData = support.exists ? readSupport(support.data || {}) : null
    const action = resolveAction({
      root: rootData,
      support: supportData,
      uid,
      role,
      canCreate: policy.canCreate,
      appId: policy.appId,
      ecosystem: policy.ecosystem,
    })
    if (supportData && role === 'admin') {
      assertSupportCapacity(supportData, uid)
    }

    if (
      !support.exists &&
      !hasAppUserPremiumAccess(membershipData, {
        isConfiguredDeveloper:
          Boolean(policy.developerId) && uid === policy.developerId,
      })
    ) {
      const operatorSupports = await mutations.query<Record<string, unknown>>(
        supports,
        {
          field: 'operator_ids',
          op: 'array-contains',
          value: uid,
          limit: 1,
        }
      )
      if (operatorSupports.length) {
        fail(
          403,
          'Standard users can only be on one live supplier team per app. Premium unlocks multiple.'
        )
      }
    }

    const createdRoot = !root.exists
    const createdAppSupport = !support.exists

    if (createdRoot) {
      mutations.create(
        suppliers,
        supplierId,
        newSupplierRoot(policy, uid, supplierId, organizationName, companyId)
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

    if (createdAppSupport) {
      mutations.create(supports, supplierId, {
        operator_ids: [uid],
        team_ids: [uid],
        join_requests: [],
        created: serverAuditStamp({ by: uid, appId: policy.appId }),
        updated: serverAuditStamp({ by: uid }),
      })
    } else if (role === 'admin') {
      mutations.update(supports, supplierId, {
        operator_ids: FieldValue.arrayUnion(uid),
        team_ids: FieldValue.arrayUnion(uid),
        updated: serverAuditStamp({ by: uid }),
      })
    }

    mutations.update(memberships, uid, {
      console_enabled: true,
      updated: serverAuditStamp({ by: uid }),
    })

    return {
      ok: true,
      supplier_id: supplierId,
      action,
      created_root: createdRoot,
      created_app_support: createdAppSupport,
    }
  })
}
