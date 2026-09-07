import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from '../team/authority'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { FIRESTORE_MUTATION_TARGETS } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { SupplierUpdateInput } from '../../models/Supplier.model.ts'

const STRING_FIELDS = new Set(['company_id', 'slug'])
const ARRAY_FIELDS = new Set(['delivery_areas'])
const ALLOWED_FIELDS = new Set([
  ...STRING_FIELDS,
  ...ARRAY_FIELDS,
  'status',
  'visibility',
  'catalogue_state',
])

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
  const actor = await readSupplierMutationActor(event)

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    await requireSupplierMutationAuthority(mutations, actor, supplierId)
    mutations.update(FIRESTORE_MUTATION_TARGETS.suppliers, supplierId, {
      ...patch,
      updated: serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId }),
    })
  })
  return { ok: true as const, supplier_id: supplierId }
}
