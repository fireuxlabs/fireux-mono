import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/utils/entity-management'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverSupplierTeamMembersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { SupplierUpdateInput } from '../../models/Supplier.model.ts'

const STRING_FIELDS = new Set([
  'company_id',
  'slug',
])
const ARRAY_FIELDS = new Set(['delivery_areas'])
const ALLOWED_FIELDS = new Set([
  ...STRING_FIELDS,
  ...ARRAY_FIELDS,
  'status',
  'visibility',
  'catalogue_state',
])

const text = (value: unknown) => String(value ?? '').trim()
function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function parsePatch(value: unknown): SupplierUpdateInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Supplier update patch must be an object.')
  }
  const source = value as Record<string, unknown>
  const unsupported = Object.keys(source).find(
    (field) => !ALLOWED_FIELDS.has(field)
  )
  if (unsupported)
    fail(400, `Supplier update contains unsupported field: ${unsupported}.`)
  if (!Object.keys(source).length) fail(400, 'Supplier update patch is empty.')

  const patch: Record<string, unknown> = {}
  for (const [field, raw] of Object.entries(source)) {
    if (STRING_FIELDS.has(field)) {
      if (typeof raw !== 'string' || raw.length > 2_000) {
        fail(400, `Supplier ${field} must be a bounded string.`)
      }
      patch[field] = raw.trim()
      continue
    }
    if (ARRAY_FIELDS.has(field)) {
      if (
        !Array.isArray(raw) ||
        raw.length > 100 ||
        raw.some((item) => typeof item !== 'string' || item.length > 200)
      ) {
        fail(400, `Supplier ${field} must be a bounded string array.`)
      }
      patch[field] = [
        ...new Set(raw.map((item) => item.trim()).filter(Boolean)),
      ]
      continue
    }
    if (
      field === 'status' &&
      raw !== 'active' &&
      raw !== 'inactive' &&
      raw !== 'archived'
    ) {
      fail(400, 'Supplier status is invalid.')
    }
    if (field === 'visibility' && typeof raw !== 'boolean') {
      fail(400, 'Supplier visibility must be a boolean.')
    }
    if (
      field === 'catalogue_state' &&
      raw !== 'integrated' &&
      raw !== 'directory_only'
    ) {
      fail(400, 'Supplier catalogue state is invalid.')
    }
    patch[field] = raw
  }
  return patch as SupplierUpdateInput
}

async function requireOperator(
  mutations: GuardedServerTransaction,
  actor: { appId: string; ecosystem: string; uid: string },
  supplierId: string
) {
  const [supplier, membership, teamMember] = await Promise.all([
    mutations.read(FIRESTORE_MUTATION_TARGETS.suppliers, supplierId),
    mutations.read(serverAppUsersTarget(actor.appId), actor.uid),
    mutations.read(serverSupplierTeamMembersTarget(supplierId), actor.uid),
  ])
  if (!supplier.exists) fail(404, 'Supplier not found.')
  if (
    !membership.exists ||
    !['admin', 'user'].includes(text(membership.data?.role))
  ) {
    fail(403, 'Current App membership is required to manage this Supplier.')
  }
  const role = text(teamMember.data?.role)
  if (
    !teamMember.exists ||
    text(teamMember.data?.user_id) !== actor.uid ||
    text(teamMember.data?.status) !== 'active' ||
    (role !== 'owner' && role !== 'operator')
  ) {
    fail(403, 'Supplier owner or operator access is required.')
  }
  const management = readFireuxEntityManagement(supplier.data?.management)
  const managedAppId = management
    ? resolveFireuxEntityManagementAppId(management, actor.ecosystem)
    : ''
  if (management?.mode !== 'root' && managedAppId !== actor.appId) {
    fail(409, 'Supplier belongs to another App scope.')
  }
}

export async function updateSupplier(event: H3Event, value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Supplier update request must be an object.')
  }
  const source = value as Record<string, unknown>
  const unsupported = Object.keys(source).find(
    (field) => field !== 'supplier_id' && field !== 'patch'
  )
  if (unsupported)
    fail(
      400,
      `Supplier update contains unsupported request field: ${unsupported}.`
    )
  const supplierId = requireFirestoreDocumentId(
    source.supplier_id,
    'Supplier id'
  )
  const patch = parsePatch(source.patch)
  const fireux = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(fireux.appId, 'Runtime App id')
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to manage this Supplier.'
  )
  const actor = { appId, ecosystem: fireux.ecosystem, uid }

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireOperator(mutations, actor, supplierId)
    mutations.update(FIRESTORE_MUTATION_TARGETS.suppliers, supplierId, {
      ...patch,
      updated: serverAuditStamp({ by: uid, appId }),
    })
  })
  return { ok: true as const, supplier_id: supplierId }
}
