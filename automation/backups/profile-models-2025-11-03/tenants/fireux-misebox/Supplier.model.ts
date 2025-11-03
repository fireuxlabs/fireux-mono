// @ts-nocheck
// Snapshot of packages/tenants/fireux-misebox/src/runtime/models/profiles/Supplier.model.ts taken on 2025-11-03
// packages/tenants/fireux-misebox/src/runtime/models/profiles/Supplier.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/core/profile.model.ts'

/** Unified Supplier (kept symmetric with Chef) */
export interface Supplier {
  id: string
  display_name?: string
  avatar?: string
  core: SupplierCoreProfile | null
  app?: SupplierAppProfile | null
}

/** Global: suppliers/{uid} */
export interface SupplierCoreProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  bio_long?: string | null
  specialties?: string[]
}

/** App overlay: apps/{appId}/suppliers/{uid} */
export interface SupplierAppProfile extends ProfileBase {
  title?: string | null
  bio_short?: string | null
  specialties?: string[]
}

/** Card shapes (mirrors Chef shapes) */
export namespace SupplierCard {
  export interface Pill {
    id: string
    display_name: string
    avatar?: string
    title?: string | null
  }
  export interface Cell extends Pill {
    bio_short?: string | null
    specialties?: string[]
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
