# Update dump (canonical mappers + create wrappers)

This file aggregates the full contents of all updated files for easy review.

---

## packages/core/fireux-core/src/runtime/utils/fieldMap.ts

```ts
// packages/core/fireux-core/src/runtime/utils/fieldMap.ts
export type MapDef = Record<string, string>

export interface MapOptions {
  /** drop keys whose value is undefined or null */
  dropNullish?: boolean
}

export function createFieldMapper<
  TUi extends Record<string, any>,
  TFs extends Record<string, any>,
>(map: MapDef) {
  const reverse = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [v, k])
  ) as Record<string, string>

  function toFs(ui: Partial<TUi>, opts: MapOptions = {}): Partial<TFs> {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(ui ?? {})) {
      if (opts.dropNullish && (v === undefined || v === null)) continue
      const target = (map as Record<string, string>)[k] ?? k
      out[target] = v
    }
    return out as Partial<TFs>
  }

  function fromFs(fs: Partial<TFs>, opts: MapOptions = {}): Partial<TUi> {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(fs ?? {})) {
      if (opts.dropNullish && (v === undefined || v === null)) continue
      const target = reverse[k] ?? k
      out[target] = v
    }
    return out as Partial<TUi>
  }

  return { toFs, fromFs }
}
```

---

## packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts

```ts
//packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'
import { createFieldMapper } from 'fireux-core/runtime/utils/fieldMap'

/** Global doc: chefs/{uid} */
export interface ChefCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/chefs/{uid} */
export interface ChefAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** UI views */
export interface ChefPillProps {
  id: string
  name: string
  avatar: string
  title?: string | null
}

export interface ChefCellProps extends ChefPillProps {
  bioShort?: string | null
  specialties?: string[]
}

export interface ChefProfileProps extends ChefCellProps {
  bioLong?: string | null
}

/** Validation + Config */
export function validateChefProfile(p: Partial<ChefCoreProfile>): boolean {
  return !!p?.name
}

export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties'],
} as const

/** Input / Update */
export type ChefInput = Omit<
  ChefCoreProfile,
  'id' | 'created_at' | 'updated_at'
>
export type ChefUpdate = Partial<ChefInput>

// Field mapping: UI camelCase ↔ Firestore snake_case
const chefFieldMap = {
  bioShort: 'bio_short',
  bioLong: 'bio_long',
} as const

export const ChefMapper = createFieldMapper<
  Partial<ChefCoreProfile>,
  Partial<Record<string, any>>
>(chefFieldMap)
```

---

## packages/tenants/fireux-misebox/src/runtime/models/profiles/Supplier.model.ts

```ts
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
  any
>({
  bioShort: 'bio_short',
  bioLong: 'bio_long',
})
```

---

## packages/extensions/fireux-jobs/src/runtime/models/profiles/Employer.model.ts

```ts
//packages/extensions/fireux-jobs/src/runtime/models/profiles/Employer.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from '../../../../../../core/fireux-core/src/runtime/models/profiles/profile.model'
import { createFieldMapper } from '../../../../../../core/fireux-core/src/runtime/utils/fieldMap'

/** Global doc: employers/{uid} */
export interface EmployerCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/employers/{uid} */
export interface EmployerAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** UI props */
export interface EmployerPillProps {
  id: string
  name: string
  avatar: string
  title?: string | null
}
export interface EmployerCellProps extends EmployerPillProps {
  bioShort?: string | null
  specialties?: string[]
}
export interface EmployerProfileProps extends EmployerCellProps {
  bioLong?: string | null
}

/** Mappers */
// UI mappers intentionally omitted in slim model to keep surface minimal.

/** Validation + Config */
export function validateEmployerProfile(
  p: Partial<EmployerCoreProfile>
): boolean {
  return !!p?.name
}

export const employerConfig: ProfileConfig = {
  id: 'employer',
  collectionName: 'employers',
  profileType: 'Employer',
  validationFn: validateEmployerProfile,
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties'],
} as const

// CTA Configuration (kept for compatibility with existing UI)
// CTA config removed from model to keep concerns separate in slim mode.

/** Input / Update */
export type EmployerInput = Omit<
  EmployerCoreProfile,
  'id' | 'created_at' | 'updated_at'
>
export type EmployerUpdate = Partial<EmployerInput>

// Back-compat alias (kept for type stability)
export type Employer = EmployerCoreProfile

// Field mapping: UI camelCase ↔ Firestore snake_case
export const EmployerMapper = createFieldMapper<
  { bioShort?: string | null; bioLong?: string | null },
  any
>({
  bioShort: 'bio_short',
  bioLong: 'bio_long',
})
```

---

## packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts

```ts
//packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from '../../../../../../core/fireux-core/src/runtime/models/profiles/profile.model'
import { createFieldMapper } from '../../../../../../core/fireux-core/src/runtime/utils/fieldMap'

/** Global doc: professionals/{uid} */
export interface ProfessionalCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/professionals/{uid} */
export interface ProfessionalAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** UI props */
export interface ProfessionalPillProps {
  id: string
  name: string
  avatar: string
  title?: string | null
}
export interface ProfessionalCellProps extends ProfessionalPillProps {
  bioShort?: string | null
  specialties?: string[]
}
export interface ProfessionalProfileProps extends ProfessionalCellProps {
  bioLong?: string | null
}

/** Validation + Config */
export function validateProfessionalProfile(
  p: Partial<ProfessionalCoreProfile>
): boolean {
  return !!p?.name
}

export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties'],
} as const

/** Input / Update */
export type ProfessionalInput = Omit<
  ProfessionalCoreProfile,
  'id' | 'created_at' | 'updated_at'
>
export type ProfessionalUpdate = Partial<ProfessionalInput>

// Back-compat alias (kept for type stability)
export type Professional = ProfessionalCoreProfile

// Field mapping: UI camelCase ↔ Firestore snake_case
export const ProfessionalMapper = createFieldMapper<
  { bioShort?: string | null; bioLong?: string | null },
  any
>({
  bioShort: 'bio_short',
  bioLong: 'bio_long',
})
```

---

## packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts

```ts
// packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts
import { useProfileCreate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileCreate'
import { chefConfig, ChefMapper } from '../../../../models/profiles/Chef.model'
import type { ChefCoreProfile } from '../../../../models/profiles/Chef.model'

/**
 * Chef-specific creation wrapper.
 * Forwards to useProfileCreate but gives us a hook
 * for Chef-only behavior later.
 */
export function useChefCreate() {
  const { ensure } = useProfileCreate(chefConfig)

  async function createChef(profile?: Partial<ChefCoreProfile>) {
    const fsPayload = ChefMapper.toFs(profile ?? {}, { dropNullish: true })
    return ensure(fsPayload)
  }

  return { createChef }
}
```

---

## packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplierCreate.ts

```ts
import { useProfileCreate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileCreate'
import {
  supplierConfig,
  SupplierMapper,
} from '../../../../models/profiles/Supplier.model'
import type { SupplierCoreProfile } from '../../../../models/profiles/Supplier.model'

export function useSupplierCreate() {
  const { ensure } = useProfileCreate(supplierConfig)

  async function createSupplier(profile?: Partial<SupplierCoreProfile>) {
    const fsPayload = SupplierMapper.toFs(profile ?? {}, { dropNullish: true })
    return ensure(fsPayload)
  }

  return { createSupplier }
}
```

---

## packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Employer/useEmployerCreate.ts

```ts
import { useProfileCreate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileCreate'
import {
  employerConfig,
  EmployerMapper,
} from '../../../../models/profiles/Employer.model'
import type { EmployerCoreProfile } from '../../../../models/profiles/Employer.model'

export function useEmployerCreate() {
  const { ensure } = useProfileCreate(employerConfig)

  async function createEmployer(profile?: Partial<EmployerCoreProfile>) {
    const fsPayload = EmployerMapper.toFs(profile ?? {}, { dropNullish: true })
    return ensure(fsPayload)
  }

  return { createEmployer }
}
```

---

## packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessionalCreate.ts

```ts
import { useProfileCreate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileCreate'
import {
  professionalConfig,
  ProfessionalMapper,
} from '../../../../models/profiles/Professional.model'
import type { ProfessionalCoreProfile } from '../../../../models/profiles/Professional.model'

export function useProfessionalCreate() {
  const { ensure } = useProfileCreate(professionalConfig)

  async function createProfessional(
    profile?: Partial<ProfessionalCoreProfile>
  ) {
    const fsPayload = ProfessionalMapper.toFs(profile ?? {}, {
      dropNullish: true,
    })
    return ensure(fsPayload)
  }

  return { createProfessional }
}
```
