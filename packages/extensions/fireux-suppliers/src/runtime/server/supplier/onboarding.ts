// Concurrent edit — 2026-07-21 22:34 CEST — Supplier atomic onboarding: bind root, App support, and UserApp target in one trusted transaction.
import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import {
  normalizeFireuxAppScopeState,
  resolveFireuxAppScopeStateForRole,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import { UserAppStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import type {
  SupplierOnboardingAction,
  SupplierOnboardingCompleteResult,
} from '../../models/supplier/supplier-onboarding.model.ts'
import { SupplierStorage } from '../../models/supplier/Supplier.model.ts'

type MemberRole = 'admin' | 'user'

type RuntimePolicy = {
  appId: string
  appRole: string
  appScopeState: 'parent_app' | 'tenant_app'
  canCreate: boolean
  targetIds: string[]
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
    fail(400, 'Supplier onboarding request must be an object.')
  }

  const source = value as Record<string, unknown>
  const unsupported = Object.keys(source).find(key => key !== 'supplier_id')
  if (unsupported) {
    fail(400, `Supplier onboarding contains unsupported field: ${unsupported}.`)
  }
  return source
}

function runtimePolicy(event: H3Event): RuntimePolicy {
  const fireux = record(useRuntimeConfig(event).public?.fireux)
  const appId = requireFirestoreDocumentId(fireux.id, 'Runtime App id')
  const appRole = text(fireux.role)
  const appScopeState = resolveFireuxAppScopeStateForRole(appRole)
  if (!appScopeState) fail(403, 'This App cannot own a Supplier console.')

  const supplierConfig = record(record(fireux.consoleConfig).supplier)
  const canCreate = typeof supplierConfig.canCreate === 'boolean'
    ? supplierConfig.canCreate
    : appRole !== 'tenant'
  const targetIds = Array.isArray(supplierConfig.targetIds)
    ? Array.from(new Set(supplierConfig.targetIds.map(text).filter(Boolean)))
    : []

  return { appId, appRole, appScopeState, canCreate, targetIds }
}

function assertRuntimeTarget(policy: RuntimePolicy, supplierId: string) {
  if (policy.appRole !== 'tenant') return
  if (!policy.targetIds.includes(supplierId)) {
    fail(403, 'This Supplier is not a configured target for the tenant App.')
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

function readRootScope(value: Record<string, unknown>) {
  if (Object.prototype.hasOwnProperty.call(value, 'app_scope')) {
    fail(409, 'Supplier App scope uses a non-canonical stored shape.')
  }
  const state = normalizeFireuxAppScopeState(value.app_scope_state)
  const appId = text(value.app_scope_app_id)

  if (!state) fail(409, 'Supplier App scope is missing or invalid.')
  if (state === 'root_only' && appId) {
    fail(409, 'An unattached Supplier cannot name an App.')
  }
  if (state !== 'root_only' && !appId) {
    fail(409, 'An attached Supplier must name its App.')
  }

  return { state, appId }
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

function assertMembershipCapacity(
  membership: Record<string, unknown>,
  supplierId: string
) {
  if (membership.console_targets === undefined) return
  if (
    !membership.console_targets ||
    typeof membership.console_targets !== 'object' ||
    Array.isArray(membership.console_targets)
  ) {
    fail(409, 'UserApp console targets have an invalid stored shape.')
  }
  const targets = membership.console_targets as Record<string, unknown>
  if (targets.supplier_ids === undefined) return

  const ids = boundedIds(
    targets.supplier_ids,
    50,
    'UserApp Supplier console targets'
  )
  if (!ids.includes(supplierId) && ids.length >= 50) {
    fail(409, 'The UserApp Supplier console target list is full.')
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

  const scope = readRootScope(input.root)
  if (scope.state !== 'root_only' && scope.appId !== input.appId) {
    fail(409, 'This Supplier is already attached to another App.')
  }
  if (scope.state === 'root_only' && input.support) {
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
  uid: string
): Record<string, unknown> {
  return {
    app_scope_state: policy.appScopeState,
    app_scope_app_id: policy.appId,
    company_id: '',
    slug: '',
    supplier_organization_name: '',
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
  const db = getRuntimeFirestore()
  const requestedSupplierId = text(body.supplier_id)
  const supplierId = requestedSupplierId
    ? requireFirestoreDocumentId(requestedSupplierId, 'Supplier id')
    : db.collection(SupplierStorage.rootCollection).doc().id
  assertRuntimeTarget(policy, supplierId)

  const rootRef = db.collection(SupplierStorage.rootCollection).doc(supplierId)
  const supportRef = db.doc(
    `apps/${policy.appId}/${SupplierStorage.appSupportCollection}/${supplierId}`
  )
  const membershipRef = db.doc(
    `apps/${policy.appId}/${UserAppStorage.collection}/${uid}`
  )

  return db.runTransaction(async transaction => {
    const [membership, root, support] = await Promise.all([
      transaction.get(membershipRef),
      transaction.get(rootRef),
      transaction.get(supportRef),
    ])
    const role = memberRole(membership.exists, membership.get('role'))
    const membershipData = membership.data() || {}
    assertMembershipCapacity(membershipData, supplierId)

    if (requestedSupplierId && !root.exists) {
      fail(404, 'Supplier not found.')
    }
    if (!root.exists && support.exists) {
      fail(409, 'Supplier access exists without its canonical root.')
    }

    const rootData = root.exists ? root.data() || {} : null
    const supportData = support.exists ? readSupport(support.data() || {}) : null
    const action = resolveAction({
      root: rootData,
      support: supportData,
      uid,
      role,
      canCreate: policy.canCreate,
      appId: policy.appId,
    })
    if (supportData && role === 'admin') {
      assertSupportCapacity(supportData, uid)
    }

    if (!support.exists && membership.get('is_premium') !== true) {
      const operatorSupports = await transaction.get(
        db
          .collection(
            `apps/${policy.appId}/${SupplierStorage.appSupportCollection}`
          )
          .where('operator_ids', 'array-contains', uid)
          .limit(1)
      )
      if (!operatorSupports.empty) {
        fail(
          403,
          'Standard users can only be on one live supplier team per app. Premium unlocks multiple.'
        )
      }
    }

    const createdRoot = !root.exists
    const createdAppSupport = !support.exists

    if (createdRoot) {
      transaction.create(rootRef, newSupplierRoot(policy, uid))
    } else {
      const scope = readRootScope(rootData || {})
      if (
        scope.state !== policy.appScopeState ||
        scope.appId !== policy.appId
      ) {
        transaction.update(rootRef, {
          app_scope_state: policy.appScopeState,
          app_scope_app_id: policy.appId,
          updated: serverAuditStamp({ by: uid }),
        })
      }
    }

    if (createdAppSupport) {
      transaction.create(supportRef, {
        operator_ids: [uid],
        team_ids: [uid],
        join_requests: [],
        created: serverAuditStamp({ by: uid, appId: policy.appId }),
        updated: serverAuditStamp({ by: uid }),
      })
    } else if (role === 'admin') {
      transaction.update(supportRef, {
        operator_ids: FieldValue.arrayUnion(uid),
        team_ids: FieldValue.arrayUnion(uid),
        updated: serverAuditStamp({ by: uid }),
      })
    }

    transaction.update(membershipRef, {
      console_enabled: true,
      'console_targets.supplier_ids': FieldValue.arrayUnion(supplierId),
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
