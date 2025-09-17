# Canonical Profile Models (v1)

Purpose: Lock a minimal, consistent shape for all profile types. Keep creation lean; make UI tolerant via mappers. Expand later via ADRs as needed.

Primary base types: `packages/core/fireux-core/src/runtime/models/profiles/profile.model.ts`

Notes:

- All profiles extend a shared `ProfileBase` with `id`, `avatar`, and timestamps.
- Each profile type has two shapes: Core (global doc) and App (tenant mirror). They expose the same canonical fields; legacy fields remain optional for back-compat only.
- UI consumes normalized props via small mappers (toPill/toCell/toProfile) to hide schema differences.

## Base: ProfileBase

- id: string — Firebase Auth UID / Firestore doc id
- avatar: string — URL
- avatar_meta?: { width?: number; height?: number; mime?: string; source?: 'upload' | 'provider' | 'default' }
- created_at: string | Date | FirebaseTimestamp
- updated_at?: string | Date | FirebaseTimestamp

Notes:

- id and avatar are required everywhere.
- Timestamps exist on all docs. `created_at` is immutable. `updated_at` is optional.

## Chef

Files:

- `packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts`

Shapes:

- Core/global: `ChefCoreProfile` at `chefs/{uid}`
- App mirror: `ChefAppProfile` at `apps/{appId}/chefs/{uid}`

Canonical fields (both shapes):

- name: string
- title?: string | null
- bioShort?: string | null
- bioLong?: string | null (Core only)
- specialties?: string[]
- available?: boolean (Core only)
- gallery?: Array<{ name?: string; image_url: string }> (Core only)

Legacy fields (optional; read-only): chef_name, bio_short, bio_long, cuisine_expertise, available_for_hire.

UI mappers: toChefPill, toChefCell, toChefProfile return normalized props.

Collection: `chefs` (global), `apps/{appId}/chefs` (tenant mirror)

## Supplier

File:

- `packages/tenants/fireux-misebox/src/runtime/models/profiles/Supplier.model.ts`

Shapes:

- Core/global: `SupplierCoreProfile` at `suppliers/{uid}`
- App mirror: `SupplierAppProfile` at `apps/{appId}/suppliers/{uid}`

Canonical fields:

- name: string
- title?: string | null
- bioShort?: string | null
- bioLong?: string | null (Core only)
- specialties?: string[]

Legacy/extended optional fields retained: business_name, business_type, claimed, claimed_by, created_by, email, phone, total_ingredients, verified, avatarUrl, profile_image, company_name, locations, bio_short, bio_long, products_offered, employee_count, years_in_business, certifications, delivery_range.

UI mappers removed in slim models; UI components consume canonical props directly (Pill/Cell/Profile types).

Collection: `suppliers` (global), `apps/{appId}/suppliers` (tenant mirror)

## Employer

File:

- `packages/extensions/fireux-jobs/src/runtime/models/profiles/Employer.model.ts`

Shapes:

- Core/global: `EmployerCoreProfile` at `employers/{uid}`
- App mirror: `EmployerAppProfile` at `apps/{appId}/employers/{uid}`

Canonical fields:

- name: string (company)
- title?: string | null
- bioShort?: string | null
- bioLong?: string | null (Core only)
- specialties?: string[]

Legacy optional: company_name, business_type, email, website, locations, social_media, verified, bio_short.

UI mappers removed in slim models; UI components consume canonical props directly (Pill/Cell/Profile types).

Collection: `employers` (global), `apps/{appId}/employers` (tenant mirror)

## Professional

File:

- `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts`

Shapes:

- Core/global: `ProfessionalCoreProfile` at `professionals/{uid}`
- App mirror: `ProfessionalAppProfile` at `apps/{appId}/professionals/{uid}`

Canonical fields:

- name: string
- title?: string | null
- bioShort?: string | null
- bioLong?: string | null (Core only)
- specialties?: string[]

Legacy optional: professional_name, email, kitchen_experience[], languages[], bio_short, bio_long.

UI mappers removed in slim models; UI components consume canonical props directly (Pill/Cell/Profile types).

Collection: `professionals` (global), `apps/{appId}/professionals` (tenant mirror)

## Constraints and conventions

- All global docs include: `id`, `avatar`, timestamps. Legacy docs may omit `avatar`; our ensure flow fills a sensible default.
- Additional optional fields may be present; consumers must be tolerant to missing fields. UI should use the mappers.
- Tenancy:
  - Global doc exists in top-level collection (e.g., `chefs/{uid}`, `suppliers/{uid}`).
  - Tenant apps may maintain a shallow mirror under `apps/{appId}/{collection}/{uid}` with minimal fields.
- Creation writes are minimal and strip empty values.

## Creation behavior (ensure)

Composable: `useProfileCreate(config).ensureProfile(additionalData?)`

- Always ensures the global doc exists in `<collection>/{uid}`.
- If role === 'tenant', also ensures AppUser exists, updates AppUser.profiles with this type, and creates/merges a minimal app mirror doc under `apps/{appId}/<collection>/{uid}`.
- Minimal payloads:
  - Global: `{ id, avatar, name?, ...config.defaultValues, ...additionalData(cleaned), created_at, updated_at }`
  - Mirror: `{ id, avatar, name?, created_at, updated_at }`
- Name is computed once if not provided (displayName → email prefix). Avatar prefers user.photoURL → default avatar.
- Empty values are removed before writes (undefined, null, empty string/array/object).

## Roadmap (later)

- Indexes: normalize `name` derivation and add search indexes.
- Validation configs per type (requiredFields, searchableFields).
- Consider moving rich/nested fields to subcollections to keep root lean.
- Author an ADR to lock schema and migrations before expanding fields.
