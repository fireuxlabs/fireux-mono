// packages/tenants/fireux-misebox/src/runtime/models/profiles/Supplier.model.ts
import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'
import type { Pill as PillModel } from 'fireux-core/runtime/types/pill.model.ts'

/** Unified Supplier (kept symmetric with Chef) */
export interface Supplier {
  id: string
  display_name?: string
  avatar?: string
  core: SupplierCoreProfile | null
  app?: SupplierAppProfile | null
}

/** Domain Supplier profile */
export interface SupplierProfile extends Profile {
  title?: string | null
  subtitle?: string | null
  badges?: string[]
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
  categories?: string[]
  avatar?: string | null
  avatar_url?: string | null
}

/** Global: suppliers/{uid} */
export type SupplierCoreProfile = SupplierProfile

/** App overlay: apps/{appId}/suppliers/{uid} */
export type SupplierAppProfile = SupplierProfile

/** Card shapes (mirrors Chef shapes) */
export namespace SupplierCard {
  export interface Pill extends PillModel.Props {}

  export interface Cell extends Pill {
    id: string
    to?: string
    bio_short?: string | null
    specialties?: string[]
    categories?: string[]
  }

  export interface Profile extends Cell {
    bio_long?: string | null
  }
}

/** Config */
export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',
  cta: 'Create your Supplier profile to appear in listings.',
} as const
