# Models (Temp Snapshot)

Generated: 2026-01-09

This is a quick comparison of FireUX entity/domain model files under `packages/**/src/runtime/models/**/*.ts`.

## Inventory (by package)

### Core (fireux-core)
- `packages/core/fireux-core/src/runtime/models/core/user.model.ts` — `User`, `AppUser`, `UserNotification`
- `packages/core/fireux-core/src/runtime/models/core/profile.model.ts` — `CoreProfileBase`, `AppProfileBase`, `ProfileConfig`
- `packages/core/fireux-core/src/runtime/models/core/app.model.ts` — `App`, `AppRole`, social link helpers
- `packages/core/fireux-core/src/runtime/models/core/ecosystem.model.ts` — `FireuxEcosystemRegistryDoc`
- `packages/core/fireux-core/src/runtime/models/core/module.model.ts` — `FireuxModuleRegistryDoc`
- `packages/core/fireux-core/src/runtime/models/task.model.ts` — `CoreTask`
- `packages/core/fireux-core/src/runtime/models/objects/protocols.ts` — tiny protocol types (`BaseObject`, `WithAuthor`, `Sluggable`)
- `packages/core/fireux-core/src/runtime/models/objects/object.model.ts` — generic CRUD model types (`FirestoreObject`, `ObjectInput`, `ObjectUpdate`, `ObjectCRUD`)
- `packages/core/fireux-core/src/runtime/models/utils/avatarManager.ts` — `AvatarManager`

### Extensions
- `packages/extensions/fireux-places/src/runtime/models/place.model.ts` — canonical Places (`BasePlace`, `GooglePlace`, `Place`)
- `packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts` — Company overlay (Place-bound)
- `packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts` — Kitchen overlay (Place-bound)
- `packages/extensions/fireux-jobs/src/runtime/models/job.model.ts` — `Job`
- `packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts` — `AgentCore`, `AgentApp`
- `packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/supporting.ts` — `agentConfig`
- `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts` — `ProfessionalCore`, `ProfessionalApp`
- `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/supporting.ts` — `professionalConfig`, experience item types
- `packages/extensions/fireux-blogs/src/runtime/models/objects/blogPost.model.ts` — `BlogPost`, `BlogPostEntry`, `Author`
- `packages/extensions/fireux-blogs/src/runtime/models/core/user.ext.ts` — module augmentation for `User` / `AppUser`
- `packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts` — `Product`, `FirebaseProduct`, price types
- `packages/extensions/fireux-products/src/runtime/models/core/user.ext.ts` — module augmentation for `User` / `AppUser`

### Ecosystems
- `packages/ecosystem/fireux-misebox/src/runtime/models/core/MiseApp.model.ts` — `MiseboxApp`
- `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts` — `ChefCore`, `ChefApp`
- `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/supporting.ts` — `chefConfig`
- `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts` — `SupplierCore`, `SupplierApp`
- `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/supporting.ts` — `supplierConfig`
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/Ingredient.model.ts` — `Ingredient`, `normalizeIngredient`, config
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/Recipe.model.ts` — `Recipe`, ingredient/instruction/nutrition, config
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/RecipeSimple.model.ts` — `RecipeSimpleObject`, config
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/Dish.model.ts` — `DishObject`, config
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/Menu.model.ts` — `MenuObject`, config
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/Task.model.ts` — `TaskObject`, config
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/MiseEnPlace.model.ts` — `MiseEnPlaceObject`, config
- `packages/ecosystem/fireux-cleanbox/src/runtime/models/location.model.ts` — `CleanboxLocation`, geo

---

## Canon notes (high level)

- **Places** are canonical, stored at `/places/{id}` with `id` as the only identifier. `source` is `'google' | 'firebase'`.
- **Overlays** like Companies/Kitchens are stored as `/companies/{placeId}` and `/kitchens/{placeId}` with doc id == Place id.
- Many other domains are still in mixed “object-model” shapes (some with `slug`, some with `id`, timestamps vary).

---

## Source dumps (full code)

### packages/core/fireux-core/src/runtime/models/core/user.model.ts

```ts
import type { FirestoreTimestampOrString } from '../../../types/firebase'

export type NotificationScope = 'ecosystem' | 'app'

type Ts = FirestoreTimestampOrString

export interface UserNotification {
  message: string
  scope: NotificationScope
  created_at: string
  read: boolean
  app_id?: string
}

/**
 * Core Firestore user document
 * Path: /users/<userId>
 */
export interface User {
  id: string

  display_name: string
  avatar: string

  handle: string
  email: string
  bio: string
  profiles: string[]

  /** Core memberships */
  userOf: string[]
  adminOf: string[]
}

/**
 * App-specific user overlay
 * Path: /apps/<appId>/users/<userId>
 */
export interface AppUser {
  id: string

  role: 'user' | 'admin'

  creator_id: string

  created_at: Ts
  updated_at: Ts
}
```

### packages/core/fireux-core/src/runtime/models/core/profile.model.ts

```ts
/**
 * Core profile doc base shape (global truth)
 * Example path: /chefs/<uid>, /agents/<uid>, /professionals/<uid>, etc.
 */
export interface CoreProfileBase {
  /** Canonical Firestore id (== Firebase Auth UID) */
  id: string

  /** Main title for pill/cell/etc */
  title: string

  /** Secondary subtitle for pill/cell/etc */
  subtitle: string

  /** Badges (skills, tags, specialties, etc.) */
  badges: string[]
}

/**
 * App profile overlay base shape (tenant truth)
 * Example path: /apps/<appId>/<collection>/<uid>
 *
 * Delta-only by design.
 * Keep it minimal until you truly need overlay fields.
 */
export interface AppProfileBase {
  id: string
}

/**
 * Config describing how a profile collection behaves.
 */
export interface ProfileConfig {
  /** Lowercase identifier like 'chef', 'supplier', 'agent', 'professional' */
  id: string

  /** Firestore collection name */
  collectionName: string

  /** Human-readable label */
  profileType: string

  /** CTA text for UI when profile missing */
  cta: string

  /** Label override for nav/dropdown contexts */
  navLabel: string

  /** Icon to reuse across nav/dropdown contexts */
  navIcon: string
}
```

### packages/core/fireux-core/src/runtime/models/core/app.model.ts

```ts
// FILE: packages/core/fireux-core/src/runtime/models/core/app.model.ts
import type { FirestoreTimestampOrString } from '../../../types/firebase'

export type AppRole = 'global' | 'tenant' | 'sandbox'
type Ts = FirestoreTimestampOrString

export type AppSocialPlatform =
  | 'website'
  | 'email'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'instagram'
  | 'facebook'
  | 'youtube'

export type AppSocialLinks = Record<AppSocialPlatform, string>

export const APP_SOCIAL_PLATFORMS: ReadonlyArray<AppSocialPlatform> = [
  'website',
  'email',
  'twitter',
  'linkedin',
  'github',
  'instagram',
  'facebook',
  'youtube',
] as const

export function createEmptyAppSocialLinks(): AppSocialLinks {
  return {
    website: '',
    email: '',
    twitter: '',
    linkedin: '',
    github: '',
    instagram: '',
    facebook: '',
    youtube: '',
  }
}

/** Core Firestore App document */
export interface App {
  id: string

  // Display
  app_name: string
  app_short_name: string

  // Scope + lineage
  role: AppRole
  ecosystem: string

  // Governance
  join_requests: string[]
  admin_ids: string[]
  creator_id: string
  created_by: string

  // Optional metadata
  tagline: string
  description: string
  short_bio: string
  long_bio: string
  social_links: AppSocialLinks

  // Derived counts
  user_count: number

  // System metadata
  created_at: Ts
  updated_at: Ts

  // Brand/media URLs (flat)
  /** Used on avatar/thumbnail surfaces. Empty string means "not set". */
  thumbnail_url: string
  /** @deprecated legacy field. Keep as empty string; use thumbnail_url. */
  avatar_url: string
  /** Used on logo surfaces. Empty string means "not set". */
  logo_url: string
  // Canon wordmark variants
  /** Used on light surfaces. Empty string means "not set". */
  wordmark_light_url: string
  /** Used on dark surfaces. Empty string means "not set". */
  wordmark_dark_url: string
}
```

### packages/core/fireux-core/src/runtime/models/core/ecosystem.model.ts

```ts
/**
 * Minimal Firestore payload stored at `ecosystems/<ecosystemId>`.
 * Registry sync keeps only normalized name/team plus optional relationship arrays.
 */
export interface FireuxEcosystemRegistryDoc {
  name: string
  team: string
  /** List of app ids that declared this ecosystem via registry sync. */
  apps?: string[]
}
```

### packages/core/fireux-core/src/runtime/models/core/module.model.ts

```ts
/**
 * Minimal Firestore payload stored at `modules/<moduleId>` via the registry sync.
 * The document id doubles as the slug, so we only persist the owning team + name.
 */
export interface FireuxModuleRegistryDoc {
  name: string
  team: string
}
```

### packages/core/fireux-core/src/runtime/models/task.model.ts

```ts
import type { FirebaseTimestamp } from '../../types/firebase'

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'done'
  | 'skipped'
  | 'cancelled'

export type TaskPriority = 'low' | 'normal' | 'high'

/**
 * Minimal reusable task surface that any FireUX app can extend.
 */
export interface CoreTask {
  id: string
  label: string
  description?: string | null
  status: TaskStatus
  priority?: TaskPriority
  assignee_id?: string | null

  due_at?: FirebaseTimestamp | null
  completed_at?: FirebaseTimestamp | null

  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}
```

### packages/core/fireux-core/src/runtime/models/objects/protocols.ts

```ts
export interface BaseObject {
  id: string
  createdAt?: number
  updatedAt?: number
}

export interface WithAuthor {
  authorId: string
}

export interface Sluggable {
  slug: string
}
```

### packages/core/fireux-core/src/runtime/models/objects/object.model.ts

```ts
// ~/models/objects/object.model.ts

import type { ComputedRef, Ref } from 'vue'

/**
 * Base interface that all Firestore objects should extend
 * Provides common fields for tracking, identification, and app scoping
 */
export interface FirestoreObject {
  /** Unique slug/identifier for the object */
  slug: string
  /** App ID for multi-tenancy */
  appId: string
  /** Creation timestamp */
  created_at: string | Date
  /** Last update timestamp */
  updated_at: string | Date
  /** ID of the user who created this object */
  creator_id: string
}

/**
 * Configuration for object-specific CRUD operations
 * Allows each object type to provide its own create, update, and delete logic while
 * sharing common CRUD patterns
 */
export interface ObjectConfig {
  /** Collection name in Firestore */
  collectionName: string
  /** Object type name for dynamic function naming */
  objectType?: string
  /** When true, treats the object as user-scoped and exposes `current` bound to currentUser.uid (parity with useProfile) */
  userScoped?: boolean
  /** Optional create composable for object-specific logic */
  createComposable?: () => {
    [key: string]: any
  }
  /** Optional update composable for object-specific logic */
  updateComposable?: () => {
    [key: string]: any
  }
  /** Optional delete composable for object-specific logic */
  deleteComposable?: () => {
    [key: string]: any
  }
}

/**
 * Input type for creating new objects
 * Excludes system-generated fields
 */
export type ObjectInput<T extends FirestoreObject> = Omit<
  T,
  'created_at' | 'updated_at' | 'appId'
>

/**
 * Input type for updating objects
 * Excludes system-generated and immutable fields
 */
export type ObjectUpdate<T extends FirestoreObject> = Partial<
  Omit<T, 'slug' | 'created_at' | 'updated_at' | 'appId' | 'creator_id'>
>

/**
 * Core CRUD operations interface
 */
export interface ObjectCRUD<T extends FirestoreObject> {
  // Current object (by current user's ID or current slug)
  currentObject: ComputedRef<T | null | undefined>

  // Collection of all objects
  objectsCollection: Ref<T[] | undefined>

  // Fetch by ID/slug
  fetchObject: (id: string) => Promise<Ref<T | null | undefined>>

  // Create new object
  createObject: (data: ObjectInput<T>) => Promise<boolean>

  // Delete object
  deleteObject: (id: string) => Promise<boolean>

  // Update object (if update composable provided)
  updateObject?: (id: string, updates: ObjectUpdate<T>) => Promise<boolean>
}
```

### packages/core/fireux-core/src/runtime/models/utils/avatarManager.ts

```ts
/**
 * Avatar Management Utilities
 *
 * Handles avatar logic for CoreUser and AppUser models
 */

/**
 * Avatar storage paths and URL generation
 */
export class AvatarManager {
  /**
   * Generate core user avatar storage path
   */
  static getCoreUserAvatarPath(userId: string): string {
    return `users/${userId}/avatar`
  }

  /**
   * Generate app user avatar storage path
   */
  static getAppUserAvatarPath(appId: string, userId: string): string {
    return `${appId}/users/${userId}/avatar`
  }

  /**
   * Generate Firebase Storage URL
   */
  static generateStorageUrl(bucketName: string, storagePath: string): string {
    return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
      storagePath
    )}?alt=media`
  }

  /**
   * Check if avatar URL is app-specific (not core user avatar)
   */
  static isAppSpecificAvatar(avatarUrl: string, appId: string): boolean {
    return avatarUrl.includes(`apps/${appId}/users/`)
  }

  /**
   * Check if avatar URL is a core user avatar
   */
  static isCoreUserAvatar(avatarUrl: string): boolean {
    return avatarUrl.includes('users/') && !avatarUrl.includes('apps/')
  }

  /**
   * Check if avatar URL is external (Google, etc.)
   */
  static isExternalAvatar(avatarUrl: string): boolean {
    return !avatarUrl.includes('firebasestorage.googleapis.com')
  }

  /**
   * Get the default avatar for a new AppUser
   * This copies the CoreUser avatar URL
   */
  static getDefaultAppUserAvatar(coreUserAvatar: string): string {
    return coreUserAvatar
  }

  /**
   * Determine avatar strategy for AppUser
   */
  static getAvatarStrategy(
    coreUserAvatar: string,
    currentAppUserAvatar?: string,
    appId?: string
  ): {
    strategy: 'use_core' | 'use_app_specific' | 'use_external'
    shouldCopy: boolean
    description: string
  } {
    // If no current app avatar, use core avatar
    if (!currentAppUserAvatar) {
      return {
        strategy: 'use_core',
        shouldCopy: false,
        description: 'New AppUser - copy CoreUser avatar URL',
      }
    }

    // If current avatar is external, keep it
    if (this.isExternalAvatar(currentAppUserAvatar)) {
      return {
        strategy: 'use_external',
        shouldCopy: false,
        description: 'External avatar (Google, etc.) - no changes needed',
      }
    }

    // If current avatar is app-specific, keep it
    if (appId && this.isAppSpecificAvatar(currentAppUserAvatar, appId)) {
      return {
        strategy: 'use_app_specific',
        shouldCopy: false,
        description: 'App-specific avatar - user has customized for this app',
      }
    }

    // If current avatar is core but different from current core, update
    if (
      this.isCoreUserAvatar(currentAppUserAvatar) &&
      currentAppUserAvatar !== coreUserAvatar
    ) {
      return {
        strategy: 'use_core',
        shouldCopy: false,
        description: 'Update to latest CoreUser avatar',
      }
    }

    // Default: use core avatar
    return {
      strategy: 'use_core',
      shouldCopy: false,
      description: 'Default to CoreUser avatar',
    }
  }
}

/**
 * Avatar operation types for consistency
 */
export type AvatarOperation = {
  type: 'copy_from_core' | 'upload_app_specific' | 'update_url_only'
  sourcePath?: string
  destinationPath?: string
  newUrl: string
  description: string
}
```

### packages/extensions/fireux-places/src/runtime/models/place.model.ts

```ts
/**
 * Canonical Place models for `fireux-places`.
 *
 * Firestore:
 * - Collection: /places (or type-scoped collection paths via this extension)
 * - Document id: `Place.id` (== Google place_id)
 *
 * Notes:
 * - We do NOT store both `id` and `place_id` on documents.
 * - Canonical identifier is `id` only.
 */

/** Canonical sources are 'google' (provider/transient) and 'firebase' (stored). */
export type PlaceSource = 'google' | 'firebase'
/**
 * Base (shared by Google & Firestore)
 */
export interface BasePlace {
	/** Canonical id (== Google place_id; Firestore document id) */
	id: string

	name: string
	formatted_address: string
	lat: number
	lng: number
	source: PlaceSource
	avatar?: string | null
}

/** Google Place (transient/provider) */
export interface GooglePlace extends BasePlace {
	source: 'google'
	website?: string | null
	phone?: string | null
	rating?: number | null
	user_ratings_total?: number | null
}

/** Firestore Place (stored) */
export interface Place extends BasePlace {
	id: string
	source: 'firebase'

	name: string
	formatted_address: string
	lat: number
	lng: number

	avatar: string

	search_term: string
	creator_id: string

	created_at: any
	updated_at: any
}

/** Payload used before Firestore stamping is applied. */
export type PlaceUpsertInput = Omit<Place, 'creator_id' | 'created_at' | 'updated_at'>
```

### packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts

```ts
/**
 * Company overlay (Place-bound)
 * Firestore: companies/{placeId}
 * - Document ID is the canonical Place ID.
 * - This is an overlay on top of an existing Place.
 */
export interface Company {
  /** Canonical Place ID (also the Firestore document ID). */
  id: string

  /** Display name */
  name: string

  /** Canonical address snapshot */
  formatted_address: string

  /** Canonical location snapshot */
  lat: number
  lng: number

  /** Avatar snapshot (usually places/{id}/avatar storage URL) */
  avatar: string

  /** Optional website */
  website: string

  created_at?: any
  updated_at?: any
  creator_id?: string
}

export type CompanyCreateInput = Omit<Company, 'creator_id' | 'created_at' | 'updated_at'>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
```

### packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts

```ts
export interface Kitchen {
  /** Canonical Place ID (also the Firestore document ID). */
  id: string

  name: string
  formatted_address: string
  lat: number
  lng: number
  avatar: string

  /** Optional kitchen-specific details */
  website: string

  created_at?: any
  updated_at?: any
  creator_id?: any
}

export type KitchenCreateInput = Omit<Kitchen, 'creator_id' | 'created_at' | 'updated_at'>
export type KitchenUpdateInput = Partial<Omit<KitchenCreateInput, 'id'>>
```

### packages/extensions/fireux-jobs/src/runtime/models/job.model.ts

```ts
// FILE: packages/extensions/fireux-jobs/src/runtime/models/job.model.ts

export type JobStatus = 'open' | 'closed'

/**
 * Canonical job document for the minimal pipeline/preview flows.
 */
export interface Job {
  /** Firestore document ID */
  id: string

  /** App that owns the job */
  app_id: string

  /** FireUX user who created the listing */
  created_by: string

  /** Phase-1 graph links (horizontal MVP) */
  posted_by_agent_id?: string | null
  company_id?: string | null
  place_id?: string | null
  kitchen_id?: string | null
  source?: string | null

  /** Pipeline & preview surface */
  title: string
  status: JobStatus
  description?: string | null
}
```

### packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts

```ts
import type {
  AppProfileBase,
  CoreProfileBase,
} from 'fireux-core/runtime/models/core/profile.model'
import { agentConfig } from './supporting'

/**
 * Firestore shapes only. No UI. No composable wiring. No generics.
 *
 * Core doc:  agents/{uid}
 * App doc:   apps/{appId}/agents/{uid}
 */
export interface AgentCore extends CoreProfileBase {
  tagline: string
  bio_short: string
  contact_email: string
  contact_phone: string
  /** If true, resolve from the linked user profile when possible. */
  contact_email_from_profile?: boolean
  /** If true, resolve from the linked user profile when possible. */
  contact_phone_from_profile?: boolean
  website_url: string
}

/**
 * Tenant overlay (delta-only).
 * Keep empty until you truly need tenant-specific fields.
 */
export interface AgentApp extends AppProfileBase {}

export { agentConfig }
```

### packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/supporting.ts

```ts
// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/supporting.ts

/**
 * Domain-level supporting structures for Agent profiles.
 * Keep runtime metadata separate from UI view models
 * so model imports stay Firestore-shape-only.
 */

import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

export const agentConfig: ProfileConfig = {
  id: 'agent',
  collectionName: 'agents',
  profileType: 'Agent',
  cta: 'Create your Agent profile to appear in listings.',
  navLabel: 'Agent',
  navIcon: 'i-lucide-shield-user',
} as const
```

### packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts

```ts
import type {
  AppProfileBase,
  CoreProfileBase,
} from 'fireux-core/runtime/models/core/profile.model'
import {
  professionalConfig,
  type OtherExperienceItem,
  type RelevantExperienceItem,
} from './supporting'

/**
 * Firestore shapes only. No UI. No composable wiring. No generics.
 *
 * Core doc:  professionals/{uid}
 * App doc:   apps/{appId}/professionals/{uid}
 */
export interface ProfessionalCore extends CoreProfileBase {
  tagline: string
  health_certifications: string[]
  bio_short: string
  bio_long: string
  specialties: string[]
  locations: string[]
  avatar: string
  avatar_url: string
  relevant_experience: RelevantExperienceItem[]
  other_experience: OtherExperienceItem[]
}

/**
 * Tenant overlay (delta-only).
 * Keep empty until you truly need tenant-specific fields.
 */
export interface ProfessionalApp extends AppProfileBase {}

export { professionalConfig }
```

### packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/supporting.ts

```ts
// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/supporting.ts

/**
 * Domain-level supporting structures for Professional profiles.
 * These stay separate from the UI-facing ProfessionalCard namespace
 * to keep the domain clean and future-proof.
 */

/* ---------------------------------- *
 * Experience Base Types
 * ---------------------------------- */

/** Minimal shared structure for any experience entry */
export interface ExperienceBase {
  role?: string
  from_month?: string
  from_year?: string
  to_month?: string | null
  to_year?: string | null
  ongoing?: boolean
  responsibilities?: string
}

/**
 * Experience linked to a canonical Place in Firestore.
 * places/{place_id}
 */
export interface RelevantExperienceItem extends ExperienceBase {
  place_id: string
}

/**
 * Experience referencing an external place snapshot.
 * Self-contained. Useful when the place isn't in Firestore yet.
 */
export interface OtherExperienceItem extends ExperienceBase {
  place_id?: string | null
  name: string
  formatted_address?: string
  short_address?: string
  image_url?: string | null
}

/** Combined union if needed elsewhere */
export type ExperienceItem = RelevantExperienceItem | OtherExperienceItem

/* ---------------------------------- *
 * Professional Profile Config
 * ---------------------------------- */

import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

/**
 * Runtime config consumed by useProfile()
 * Profiles live under: professionals/{uid}
 */
export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  cta: 'Create your Professional profile to appear in listings.',
  navLabel: 'Professional',
  navIcon: 'i-lucide-user-star',
} as const
```

### packages/extensions/fireux-blogs/src/runtime/models/objects/blogPost.model.ts

```ts
// Author identity comes from CoreUser (do not import from AppUser)
import type { Sluggable } from 'fireux-core/runtime/models/objects/protocols.ts'

// ------------------------------------------------------------------
// Author & full BlogPost
// ------------------------------------------------------------------
export interface BlogPost extends Sluggable {
	title: string
	content: string
	metaDescription: string
	slug: string
	created_at: string
	updated_at: string
	author: Author
	keywords: string[]
	tags: string[]
	canonicalUrl: string
	featuredImage: string
	socialImage: string
	readingTime: string
	cta_link: string
	cta_text: string
	type: 'article' | 'product'
	product_id?: string
	appId: string
}

// ------------------------------------------------------------------
// Entry type: exactly what the user fills in
// ------------------------------------------------------------------
export type BlogPostEntry = Omit<BlogPost, 'created_at' | 'updated_at' | 'appId'>

// ------------------------------------------------------------------
// Simplified BlogPost interface
// ------------------------------------------------------------------
export interface SimpleBlogPost {
	title: string
	content: string
	author: string
	createdAt: Date
	updatedAt?: Date
}

export interface Author {
	id: string
	display_name: string
	avatar?: string
	handle?: string
	email?: string
}
```

### packages/extensions/fireux-blogs/src/runtime/models/core/user.ext.ts

```ts
// Blog extension: scoped augmentation of core user types (extension-specific)

declare module 'fireux-core/runtime/models/core/user.model' {
  interface User {
    canPost?: boolean
  }

  interface AppUser {
    canPost?: boolean
  }
}

export {}
```

### packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts

```ts
export interface ProductFeature {
  title: string
  description?: string
  available: boolean
}

export interface ProductImage {
  url: string
  alt?: string
  order?: number
}

export interface Price {
  id?: string
  currency: string
  unit_amount: number
  interval?: 'day' | 'week' | 'month' | 'year'
  interval_count?: number
  type?: 'one_time' | 'recurring'
  billing_scheme?: 'per_unit' | 'tiered'
  metadata?: Record<string, any>
}

export interface DefaultPrice {
  id: string
  unit_amount: number
  interval?: 'day' | 'week' | 'month' | 'year'
}

export interface StripePriceInput {
  currency: string
  unit_amount: number
  type?: 'one_time' | 'recurring'
  interval?: 'day' | 'week' | 'month' | 'year'
  interval_count?: number
  billing_scheme?: 'per_unit' | 'tiered'
  metadata?: Record<string, any>
}

export interface Product {
  id?: string
  name: string
  description?: string
  images?: ProductImage[]
  features?: ProductFeature[]
  prices?: Price[]
  created_at?: any
  updated_at?: any
}

export interface FirebaseProduct extends Product {
  id: string
  created_at: any
  updated_at: any
  slug?: string
  content?: string
  active?: boolean
  main_image?: string
  default_price?: DefaultPrice
  stock?: number | null
  product_type?: 'physical' | 'digital' | 'service' | 'subscription'
  track_stock?: boolean
  creator_id?: string
  appId?: string
  metadata?: Record<string, any>
}

export interface ProductCreationInput {
  name: string
  description?: string
  content?: string
  images?: ProductImage[]
  features?: ProductFeature[]
  prices?: Price[]
  // Additional fields used during creation from UI
  active?: boolean
  slug?: string
  stock?: number | null
  product_type?: 'physical' | 'digital' | 'service' | 'subscription'
  track_stock?: boolean
  main_image?: string
  appId?: string
  creator_id?: string
}

export type ProductId = Product['id']
```

### packages/extensions/fireux-products/src/runtime/models/core/user.ext.ts

```ts
// Product extension: scoped augmentation of core user types (extension-specific)

declare module 'fireux-core/runtime/models/core/user.model' {
  interface User {
    canManageProducts?: boolean
  }

  interface AppUser {
    canManageProducts?: boolean
  }
}

export {}
```

### packages/ecosystem/fireux-misebox/src/runtime/models/core/MiseApp.model.ts

```ts
// Simple kitchen extension
export interface MiseboxApp {
  //profiles
  chefs?: string[] // Array of chef IDs
  professionals?: string[] // Array of professional IDs
  agents?: string[] // Array of agent IDs
  suppliers?: string[] // Array of supplier IDs
}
```

### packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts

```ts
import type {
  AppProfileBase,
  CoreProfileBase,
} from 'fireux-core/runtime/models/core/profile.model'
import { chefConfig } from './supporting'

/**
 * Firestore shapes only. No UI. No composable wiring. No generics.
 *
 * Core doc:  chefs/{uid}
 * App doc:   apps/{appId}/chefs/{uid}
 */

export interface ChefCore extends CoreProfileBase {
  tagline: string
  bio_short: string
  bio_long: string
  specialties: string[]
  locations: string[]
  avatar: string
  avatar_url: string
  organization_name: string
}

/**
 * Tenant overlay (delta-only).
 * Keep empty until you truly need tenant-specific fields.
 */
export interface ChefApp extends AppProfileBase {}

export { chefConfig }
```

### packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/supporting.ts

```ts
// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/supporting.ts

/**
 * Chef profile metadata + domain helpers live here so model consumers
 * can import a single config source of truth.
 */

import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  cta: 'Create your Chef profile to appear in listings.',
  navLabel: 'Chef',
  navIcon: 'i-lucide-chef-hat',
} as const
```

### packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts

```ts
import type {
  AppProfileBase,
  CoreProfileBase,
} from 'fireux-core/runtime/models/core/profile.model'
import { supplierConfig } from './supporting'

/**
 * Firestore shapes only. No UI. No composable wiring. No generics.
 *
 * Core doc:  suppliers/{uid}
 * App doc:   apps/{appId}/suppliers/{uid}
 */

export interface SupplierCore extends CoreProfileBase {
  tagline: string
  bio_short: string
  bio_long: string
  specialties: string[]
  categories: string[]
  avatar: string
  avatar_url: string
  organization_name: string

  business_type: string
  locations: Array<{ city: string; country: string }>
  years_in_business: number
  products_offered: string[]
  employee_count: number
  certifications: string[]
  delivery_range: number
}

/**
 * Tenant overlay (delta-only).
 * Keep empty until you truly need tenant-specific fields.
 */
export interface SupplierApp extends AppProfileBase {}

export { supplierConfig }
```

### packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/supporting.ts

```ts
// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/supporting.ts

/**
 * Supplier profile metadata holder. Mirrors Professional/Chef structure
 * and gives dashboard surfaces a single config import path.
 */

import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',
  cta: 'Create your Supplier profile to appear in listings.',
  navLabel: 'Supplier',
  navIcon: 'i-lucide-package',
} as const
```

### packages/ecosystem/fireux-misebox/src/runtime/models/objects/Ingredient.model.ts

```ts
/**
 * Ingredient Model (Tenant: Misebox)
 * Simple ingredient representation for rapid development
 */

// Simple Ingredient interface - just the essentials
export interface Ingredient {
  id: string
  name: string
  // Optional fields used by UI components
  description?: string
  category?: string
  categories?: string[]
  tags?: string[]
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
  storage?: {
    method?: string
    temperature?: string
    shelf_life?: string
  }
  allergens?: string[]
  local?: boolean
  organic?: boolean
  seasonal?: boolean
  createdAt?: string
  updatedAt?: string
  created_at?: string
  // Supplier info displayed in UI when present
  supplierId?: string
  supplierInfo?: {
    business_name?: string
    verified?: boolean
  }
}

// Simple creation input
export interface NewIngredientInput {
  name: string
}

// Simple normalization - just the essentials
export function normalizeIngredient(id: string, raw: any): Ingredient {
  return {
    id,
    name: raw.name || 'Ingredient',
  }
}

// Simple config
export const ingredientConfig = {
  id: 'ingredient',
  objectType: 'ingredient',
  collectionName: 'ingredients',
  color: 'green',
  searchableFields: ['name'],
}

// Export simple types
export type IngredientInput = Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>
export type IngredientUpdate = Partial<IngredientInput>
```

### packages/ecosystem/fireux-misebox/src/runtime/models/objects/Recipe.model.ts

```ts
// Minimal local copy to avoid cross-package type import
export interface FirestoreObject {
  slug: string
  appId: string
  created_at: string | Date
  updated_at: string | Date
  creator_id: string
}

export interface Recipe extends FirestoreObject {
  // Basic Information
  title: string
  description: string
  chef_id?: string // Optional - can be created by chefs or global recipes
  chef_name?: string // Chef name for display

  // Recipe Details
  cuisine_type: string[]
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'
  prep_time_minutes: number
  cook_time_minutes: number
  total_time_minutes: number
  servings: number

  // Ingredients & Instructions
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]

  // Nutritional Information (optional)
  nutrition?: RecipeNutrition

  // Media & Presentation
  featured_image?: string
  images: string[]
  video_url?: string

  // Metadata
  tags: string[]
  dietary_restrictions: string[] // e.g., 'vegetarian', 'gluten-free', 'dairy-free'
  allergens: string[] // e.g., 'nuts', 'shellfish', 'eggs'

  // Social Features
  is_public: boolean
  is_featured: boolean
  likes_count: number
  saves_count: number
  views_count: number

  // Business Features
  cost_estimate?: {
    ingredients_cost: number
    labor_cost?: number
    total_cost: number
    currency: string
  }

  // App/Domain Scoping
  parent_app_id?: string // For Niederhorn-specific recipes
  source: 'global' | 'app_specific' // Global MiseBox or app-specific

  // Status
  status: 'draft' | 'published' | 'archived'
  published_at?: string | Date
}

export interface RecipeIngredient {
  name: string
  amount: number
  unit: string
  notes?: string
  category?: string // e.g., 'protein', 'vegetable', 'spice'
  is_optional: boolean
}

export interface RecipeInstruction {
  step_number: number
  instruction: string
  time_minutes?: number
  temperature?: {
    value: number
    unit: 'C' | 'F'
  }
  image?: string
  notes?: string
}

export interface RecipeNutrition {
  calories_per_serving: number
  protein_grams: number
  carbs_grams: number
  fat_grams: number
  fiber_grams: number
  sugar_grams: number
  sodium_mg: number
}

// Configuration for the Recipe object type
export const recipeConfig = {
  id: 'recipe',
  collectionName: 'recipes',
  objectType: 'Recipe',
  color: 'purple', // Recipe color theme
  defaultValues: {
    title: '',
    description: '',
    cuisine_type: [],
    difficulty_level: 'Beginner' as const,
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    total_time_minutes: 45,
    servings: 4,
    ingredients: [],
    instructions: [],
    images: [],
    tags: [],
    dietary_restrictions: [],
    allergens: [],
    is_public: true,
    is_featured: false,
    likes_count: 0,
    saves_count: 0,
    views_count: 0,
    source: 'global' as const,
    status: 'draft' as const,
  },
} as const

// Export types for use
export type RecipeInput = Omit<
  Recipe,
  'slug' | 'appId' | 'created_at' | 'updated_at' | 'creator_id'
>
export type RecipeUpdate = Partial<RecipeInput>
```

### packages/ecosystem/fireux-misebox/src/runtime/models/objects/RecipeSimple.model.ts

```ts
import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model.ts'

export interface RecipeSimpleObject extends Partial<FirestoreObject> {
  name: string
}

export const recipeSimpleConfig = {
  collectionName: 'recipes',
  objectType: 'Recipe',
}
```

### packages/ecosystem/fireux-misebox/src/runtime/models/objects/Dish.model.ts

```ts
import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model.ts'

export interface DishObject extends Partial<FirestoreObject> {
  name: string
}

export const dishConfig = {
  collectionName: 'dishes',
  objectType: 'Dish',
}
```

### packages/ecosystem/fireux-misebox/src/runtime/models/objects/Menu.model.ts

```ts
import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model.ts'

export interface MenuObject extends Partial<FirestoreObject> {
  name: string
}

export const menuConfig = {
  collectionName: 'menus',
  objectType: 'Menu',
}
```

### packages/ecosystem/fireux-misebox/src/runtime/models/objects/Task.model.ts

```ts
import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model.ts'

export interface TaskObject extends Partial<FirestoreObject> {
  name: string
}

export const taskConfig = {
  collectionName: 'kitchen_tasks',
  objectType: 'Task',
}
```

### packages/ecosystem/fireux-misebox/src/runtime/models/objects/MiseEnPlace.model.ts

```ts
import type { FirestoreObject } from 'fireux-core/runtime/models/objects/object.model.ts'

export interface MiseEnPlaceObject extends Partial<FirestoreObject> {
  name: string
}

export const miseEnPlaceConfig = {
  collectionName: 'mise_items',
  objectType: 'MiseItem',
}
```

### packages/ecosystem/fireux-cleanbox/src/runtime/models/location.model.ts

```ts
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export interface CleanboxLocationGeo {
  lat: number
  lng: number
}

/**
 * Cleanbox-specific location record describing a serviced property.
 */
export interface CleanboxLocation {
  id: string
  app_id: string
  agent_id: string | null
  nickname?: string | null
  label: string

  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  postcode?: string | null
  country?: string | null

  geo?: CleanboxLocationGeo | null
  notes?: string | null
  access_code?: string | null
  alarm_code?: string | null

  core_place_id?: string | null

  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}
```
