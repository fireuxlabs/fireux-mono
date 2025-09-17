//packages/tenants/fireux-misebox/src/runtime/models/profiles/Supplier.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'
import { createFieldMapper } from 'fireux-core/runtime/utils/fieldMap'

/** Global doc: suppliers/{uid} */
export interface SupplierCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/suppliers/{uid} */
export interface SupplierAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** UI props */
export interface SupplierPillProps {
  id: string
  name: string
  avatar: string
  title?: string | null
}
export interface SupplierCellProps extends SupplierPillProps {
  bioShort?: string | null
  specialties?: string[]
}
export interface SupplierProfileProps extends SupplierCellProps {
  bioLong?: string | null
}

/** Mappers (canonical-first; graceful legacy fallbacks) */
// UI mappers intentionally omitted in slim model to keep surface minimal.

/** Validation + Config */
export function validateSupplierProfile(
  p: Partial<SupplierCoreProfile>
): boolean {
  return !!p?.name
}

export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',
  validationFn: validateSupplierProfile,
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties'],
} as const

// CTA Configuration (kept for compatibility with existing UI)
// CTA config removed from model to keep concerns separate in slim mode.

/** Input / Update */
export type SupplierInput = Omit<
  SupplierCoreProfile,
  'id' | 'created_at' | 'updated_at'
>
export type SupplierUpdate = Partial<SupplierInput>

// Back-compat alias (kept for type stability)
export type Supplier = SupplierCoreProfile

// Field mapping: UI camelCase ↔ Firestore snake_case
export const SupplierMapper = createFieldMapper<
  { bioShort?: string | null; bioLong?: string | null },
  Record<string, unknown>
>({
  bioShort: 'bio_short',
  bioLong: 'bio_long',
})
