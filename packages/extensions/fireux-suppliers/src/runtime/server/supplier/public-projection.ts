import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type {
  PublicSupplier,
  PublicSupplierDetail,
  PublicSupplierIndex,
  PublicSupplierItem,
} from '../../models/supplier/supplier-public.model.ts'
import {
  SupplierItemStorage,
  SupplierStorage,
} from '../../models/supplier/Supplier.model.ts'

const text = (value: unknown) => String(value ?? '').trim()
const strings = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
        .map(entry => entry.trim()).filter(Boolean).slice(0, 40)
    : []
const numberOrNull = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

function projectSupplier(id: string, value: Record<string, unknown>): PublicSupplier | null {
  if (!['public', 'official'].includes(text(value.state))) return null
  const organizationName = text(value.supplier_organization_name)
  if (!organizationName) return null
  return {
    id,
    organization_name: organizationName,
    tagline: text(value.tagline),
    headline: text(value.supplier_headline),
    summary: text(value.summary),
    image_url: text(value.supplier_image),
    categories: strings(value.supplier_item_categories),
    delivery_areas: strings(value.supplier_delivery_areas),
  }
}

function projectItem(supplierId: string, id: string, value: Record<string, unknown>): PublicSupplierItem | null {
  if (value.active !== true || text(value.supplier_id) !== supplierId) return null
  const productId = text(value.product_id)
  if (!productId) return null
  const ingredientId = text(value.ingredient_id)
  return {
    id,
    supplier_id: supplierId,
    product_id: productId,
    ...(ingredientId ? { ingredient_id: ingredientId } : {}),
    name: text(value.name_override),
    description: text(value.description_override),
    image_url: text(value.image_override),
    pack_size_label: text(value.pack_size_label),
    unit: text(value.unit),
    quantity_per_pack: numberOrNull(value.quantity_per_pack),
    order_unit: text(value.order_unit),
    pack_cost_minor: numberOrNull(value.pack_cost_minor),
    currency_code: text(value.currency_code),
    availability_state: text(value.availability_state),
    lead_time_days: numberOrNull(value.lead_time_days),
    min_order_quantity: numberOrNull(value.min_order_quantity),
  }
}

export async function readPublicSupplierIndex(): Promise<PublicSupplierIndex> {
  const snapshot = await getRuntimeFirestore()
    .collection(SupplierStorage.collection).limit(100).get()
  return {
    suppliers: snapshot.docs
      .map(doc => projectSupplier(doc.id, doc.data()))
      .filter((entry): entry is PublicSupplier => Boolean(entry))
      .sort((a, b) => a.organization_name.localeCompare(b.organization_name)),
  }
}

export async function readPublicSupplierDetail(idValue: unknown): Promise<PublicSupplierDetail> {
  const id = requireFirestoreDocumentId(idValue, 'Supplier id')
  const db = getRuntimeFirestore()
  const ref = db.collection(SupplierStorage.collection).doc(id)
  const [root, items] = await Promise.all([
    ref.get(),
    ref.collection(SupplierItemStorage.collection)
      .limit(200).get(),
  ])
  const supplier = root.exists ? projectSupplier(root.id, root.data() || {}) : null
  if (!supplier) throw createError({ statusCode: 404, statusMessage: 'Supplier not found.' })
  return {
    ...supplier,
    items: items.docs
      .map(doc => projectItem(id, doc.id, doc.data()))
      .filter((entry): entry is PublicSupplierItem => Boolean(entry)),
  }
}
