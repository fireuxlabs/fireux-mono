import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from '../../team/authority'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverSupplierItemsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'

type SupplierItemAction = 'create' | 'update' | 'delete'

const text = (value: unknown) => String(value ?? '').trim()
function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

const CREATE_FIELDS = new Set([
  'product_id',
  'ingredient_id',
  'name_override',
  'description_override',
  'image_override',
  'pack_size_label',
  'supplier_sku',
  'unit',
  'quantity_per_pack',
  'order_unit',
  'pack_cost_minor',
  'currency_code',
  'availability_state',
  'lead_time_days',
  'min_order_quantity',
  'active',
  'metadata',
])
const UPDATE_FIELDS = new Set(
  [...CREATE_FIELDS].filter(
    (field) => field !== 'product_id' && field !== 'ingredient_id'
  )
)

function payload(value: unknown, action: SupplierItemAction) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'Supplier Item payload must be an object.')
  }
  const source = value as Record<string, unknown>
  const allowed = action === 'create' ? CREATE_FIELDS : UPDATE_FIELDS
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported)
    fail(400, `Supplier Item contains unsupported field: ${unsupported}.`)
  if (action === 'update' && !Object.keys(source).length) {
    fail(400, 'Supplier Item update is empty.')
  }
  return source
}

async function authority(event: H3Event, supplierId: string) {
  const actor = await readSupplierMutationActor(event)
  return {
    ...actor,
    suppliers: FIRESTORE_MUTATION_TARGETS.suppliers,
    items: serverSupplierItemsTarget(supplierId),
  }
}

export async function createSupplierItem(
  event: H3Event,
  supplierIdInput: string,
  input: unknown
) {
  const supplierId = requireFirestoreDocumentId(supplierIdInput, 'Supplier id')
  const body = payload(input, 'create')
  const productId = requireFirestoreDocumentId(body.product_id, 'Product id')
  const ingredientId = text(body.ingredient_id)
  if (ingredientId) requireFirestoreDocumentId(ingredientId, 'Ingredient id')
  const itemId = randomUUID()
  const context = await authority(event, supplierId)

  return runGuardedServerTransaction(
    context.suppliers.database,
    async (mutations) => {
      await requireSupplierMutationAuthority(mutations, context, supplierId)
      const [product, ingredient] = await Promise.all([
        mutations.read<Record<string, unknown>>(
          FIRESTORE_MUTATION_TARGETS.products,
          productId
        ),
        ingredientId
          ? mutations.read<Record<string, unknown>>(
              FIRESTORE_MUTATION_TARGETS.ingredients,
              ingredientId
            )
          : Promise.resolve({ exists: false, data: undefined }),
      ])
      if (!product.exists)
        fail(409, 'Supplier Item requires an existing Product.')
      if (
        ingredientId &&
        (!ingredient.exists || text(ingredient.data?.status) !== 'active')
      ) {
        fail(
          409,
          'Supplier Item Ingredient must be an active canonical Ingredient.'
        )
      }
      mutations.create(context.items, itemId, {
        ...body,
        supplier_id: supplierId,
        product_id: productId,
        ...(ingredientId ? { ingredient_id: ingredientId } : {}),
        created: serverAuditStamp({
          by: context.uid,
          appId: context.runtimeAppId,
        }),
        updated: serverAuditStamp({ by: context.uid }),
      })
      return { ok: true as const, supplier_item_id: itemId }
    }
  )
}

export async function updateSupplierItem(
  event: H3Event,
  supplierIdInput: string,
  itemIdInput: string,
  input: unknown
) {
  const supplierId = requireFirestoreDocumentId(supplierIdInput, 'Supplier id')
  const itemId = requireFirestoreDocumentId(itemIdInput, 'Supplier Item id')
  const body = payload(input, 'update')
  const context = await authority(event, supplierId)

  return runGuardedServerTransaction(
    context.suppliers.database,
    async (mutations) => {
      await requireSupplierMutationAuthority(mutations, context, supplierId)
      const item = await mutations.read<Record<string, unknown>>(
        context.items,
        itemId
      )
      if (!item.exists) fail(404, 'Supplier Item not found.')
      mutations.update(context.items, itemId, {
        ...body,
        updated: serverAuditStamp({ by: context.uid }),
      })
      return { ok: true as const, supplier_item_id: itemId }
    }
  )
}

export async function deleteSupplierItem(
  event: H3Event,
  supplierIdInput: string,
  itemIdInput: string
) {
  const supplierId = requireFirestoreDocumentId(supplierIdInput, 'Supplier id')
  const itemId = requireFirestoreDocumentId(itemIdInput, 'Supplier Item id')
  const context = await authority(event, supplierId)

  return runGuardedServerTransaction(
    context.suppliers.database,
    async (mutations) => {
      await requireSupplierMutationAuthority(mutations, context, supplierId)
      const item = await mutations.read<Record<string, unknown>>(
        context.items,
        itemId
      )
      if (!item.exists) fail(404, 'Supplier Item not found.')
      mutations.delete(context.items, itemId)
      return { ok: true as const, supplier_item_id: itemId }
    }
  )
}
