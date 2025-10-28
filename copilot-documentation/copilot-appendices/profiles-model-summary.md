---
title: Misebox Profile Model Summary
created: 2025-10-28
source: AI-generated from overlay/composable refactor discussion
---

# Misebox Profile Model Summary

## Core Idea

We standardize profiles across Misebox with a global + tenant overlay pattern. Every profile offers:

- **Global layer** (Misebox core) for long-term identity.
- **App layer** (tenant overlay) for context-specific state.
- **Flattened view** to merge both when needed by UI/composables.

| Layer                 | Description                         | Example                                          |
| --------------------- | ----------------------------------- | ------------------------------------------------ |
| Global (Misebox core) | Persistent identity and portfolio   | "Chef Daniel Watson — Grill & Pastry Specialist" |
| App (Tenant overlay)  | Operational context within a tenant | "Hot Station & Buffet at Niederhorn"             |

## Shared Base (`profile.model.ts`)

- `ProfileBase` defines common timestamps and shared fields.
- `FlatProfile<TCore, TApp>` merges core + app state, optionally exposing `appProfile` where overlays exist.

```ts
// packages/core/fireux-core/src/runtime/models/profiles/profile.model.ts
export interface ProfileBase {
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

type FlatProfile<
  TCore extends ProfileBase,
  TApp extends ProfileBase
> = TCore & { appProfile?: TApp | null }
```

## Chef Profile

Represents craft and day-to-day kitchen assignments.

```ts
// packages/core/fireux-core/src/runtime/models/profiles/chef.model.ts
interface ChefCoreProfile extends ProfileBase {
  specialties?: string[]
  bio_short?: string | null
  recipes?: string[]
}

interface ChefAppProfile extends ProfileBase {
  station?: string[]
  notes?: string | null
  training_internal?: string[]
}

type Chef = FlatProfile<ChefCoreProfile, ChefAppProfile>
```

## Supplier Profile

Represents goods and services provided to kitchens or teams.

```ts
// packages/core/fireux-core/src/runtime/models/profiles/supplier.model.ts
interface SupplierCoreProfile extends ProfileBase {
  specialties?: string[]
  bio_short?: string | null
  products?: string[]
}

interface SupplierAppProfile extends ProfileBase {
  categories?: string[]
  notes?: string | null
  training_internal?: string[]
}

type Supplier = FlatProfile<SupplierCoreProfile, SupplierAppProfile>
```

## Professional Profile

Captures career identity for hospitality professionals.

```ts
// packages/core/fireux-core/src/runtime/models/profiles/professional.model.ts
interface ProfessionalCoreProfile extends ProfileBase {
  specialties?: string[]
  bio_short?: string | null
  health_certifications?: string[]
}

interface ProfessionalAppProfile extends ProfileBase {
  role_tags?: string[]
  notes?: string | null
  training_internal?: string[]
}

type Professional = FlatProfile<ProfessionalCoreProfile, ProfessionalAppProfile>
```

## Employer Profile

Models businesses/restaurants hiring and coordinating teams.

```ts
// packages/core/fireux-core/src/runtime/models/profiles/employer.model.ts
interface EmployerCoreProfile extends ProfileBase {
  specialties?: string[]
  bio_short?: string | null
  kitchens?: string[]
}

interface EmployerAppProfile extends ProfileBase {
  departments?: string[]
  notes?: string | null
  training_internal?: string[]
}

type Employer = FlatProfile<EmployerCoreProfile, EmployerAppProfile>
```

## Firestore Layout

```
misebox-core/
  chefs/{uid}
  suppliers/{uid}
  professionals/{uid}
  employers/{uid}

apps/{appId}/
  chefs/{uid}
  suppliers/{uid}
  professionals/{uid}
  employers/{uid}
```

Each tenant document extends its global counterpart with contextual fields, enabling consistent overlays.

## Benefits

- **Lightweight:** Avoids duplication; each layer owns only relevant data.
- **Consistent:** Identical structure across profile types.
- **Extensible:** Easy to add properties per layer.
- **Composable:** Aligns with new `useProfile`/overlay composables.
- **Multi-tenant:** Clear separation between global identities and tenant context.

---

_Pending:_ Add optional "Kitchen preview" section illustrating Chef ↔ Kitchen relationships with the same global/app pattern.
