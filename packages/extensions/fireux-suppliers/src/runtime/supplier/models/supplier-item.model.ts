import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type SupplierItemAvailabilityState =
  | 'available'
  | 'limited'
  | 'unavailable'
  | string

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends null
        ? null
        : T extends readonly (infer U)[]
          ? WidenLiteral<U>[]
          : T extends Record<string, unknown>
            ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
            : T

/**
 * Family: Supplier-owned commercial offer Record
 * Storage: scoped beneath the owning Supplier
 * Path: /suppliers/<supplierId>/items/<supplierItemId>
 *
 * Product owns commercial identity. SupplierItem owns this Supplier's SKU,
 * packaging, availability, procurement price, and optional Ingredient link.
 */
export const SupplierItemStorage = {
  shape: 'scoped',
  path: 'suppliers/{supplierId}/items/{supplierItemId}',
  collection: 'items',
  parent: 'supplier',
  idParam: 'supplierItemId',
} as const

export const SupplierItemRecord = defineFireuxEntity({
  kind: 'record',
  name: 'SupplierItem',
  family: ['supplier', 'commerce'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  workspace: false,
  parent: 'Supplier',
  scoped: SupplierItemStorage.path,
  notes: [
    'Every SupplierItem belongs to its path Supplier and requires product_id.',
    'ingredient_id is optional because not every commercial Product is culinary stock.',
    'SupplierItem never copies canonical Product or Ingredient identity.',
  ],
})

export const SupplierItemDefaults = {
  id: '',
  supplier_id: '',
  product_id: '',
  ingredient_id: '',

  name_override: '',
  description_override: '',
  image_override: '',

  pack_size_label: '',
  supplier_sku: '',
  unit: '',
  quantity_per_pack: null as number | null,
  order_unit: '',
  pack_cost_minor: null as number | null,
  currency_code: '',
  availability_state: 'available' as SupplierItemAvailabilityState,
  lead_time_days: null as number | null,
  min_order_quantity: null as number | null,
  active: true as boolean,
  metadata: {} as Record<string, any>,

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

type SupplierItemDefaultsShape = WidenLiteral<typeof SupplierItemDefaults>

export type SupplierItem = Omit<SupplierItemDefaultsShape, 'ingredient_id'> & {
  ingredient_id?: string
}

export type SupplierItemCreateInput = Omit<
  SupplierItem,
  'id' | 'supplier_id' | 'created' | 'updated'
>

export type SupplierItemUpdateInput = Partial<
  Omit<
    SupplierItem,
    'id' | 'supplier_id' | 'product_id' | 'created' | 'updated'
  >
>
