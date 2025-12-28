# Object / Entity Cannon Snapshot

Date: 2025-12-28

Goal: list every Firestore **object/entity** facade composable (`useX`) we currently ship, alongside:
- the composable root file path (`useX`)
- the directory tree under that object folder
- the full contents of `useX`
- the related `.model.ts` file path + contents (so we can verify canonical placement)

Scope (this pass): `packages/**/src/runtime/composables/**/fireux/firestore/objects/**`

---

## A) Company (fireux-companies)

**Root composable**
- `packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/useCompanies.ts`

**Tree**
- packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/mutations/useCompanyUpdate.ts
- packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/mutations/useCompanyCreate.ts
- packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/fetch/useCompanyFetch.ts
- packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/useCompanies.ts

**useCompanies.ts**
```ts
import { useCompanyFetch } from './fetch/useCompanyFetch'
import { useCompanyCreate } from './mutations/useCompanyCreate'
import { useCompanyUpdate } from './mutations/useCompanyUpdate'

/**
 * Canonical facade for Company: fetch + mutations.
 * Phase-1: dead object identity only.
 */
export function useCompanies() {
  const fetch = useCompanyFetch()
  const create = useCompanyCreate()
  const update = useCompanyUpdate()

  return {
    ...fetch,
    ...create,
    ...update,
  }
}
```

**Model**
- `packages/extensions/fireux-companies/src/runtime/models/company.model.ts`

```ts
/**
 * Company (core entity)
 * Firestore: companies/{companyId}
 *
 * Phase-1: dead identity object (no relationships/permissions).
 */
export interface Company {
  /** Firestore document ID (auto/uuid). Often attached by FireUX fetch helpers. */
  id?: string

  /** Display name */
  name: string

  /** Optional website (used for identity + enrichment later) */
  website?: string | null

  /** Optional logo URL for rendering */
  logo_url?: string | null
}

export type CompanyCreateInput = Pick<Company, 'name' | 'website' | 'logo_url'>
export type CompanyUpdateInput = Partial<CompanyCreateInput>
```

---

## B) Blog (fireux-blogs)

**Root composable**
- `packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/useBlog.ts`

**Tree**
- packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/useBlog.ts
- packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/mutations/useBlogDelete.ts
- packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/mutations/useBlogUpdate.ts
- packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/mutations/useBlogCreate.ts
- packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/utils/view/useBlogInterface.ts
- packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/utils/useBlogUtils.ts
- packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/fetch/useBlogFetch.ts

**useBlog.ts**
```ts
import { useBlogFetch } from './fetch/useBlogFetch.ts'
import { useBlogCreate } from './mutations/useBlogCreate.ts'
import { useBlogUpdate } from './mutations/useBlogUpdate.ts'
import { useBlogDelete } from './mutations/useBlogDelete.ts'
import { useBlogUtils } from './utils/useBlogUtils.ts'
import { useBlogInterface } from './utils/view/useBlogInterface.ts'

/**
 * Canonical facade for blog posts: fetch + mutations + helpers.
 */
export function useBlog() {
  const { items, fetchBySlug } = useBlogFetch()
  const { createBlogPost } = useBlogCreate()
  const { updateBlogPost } = useBlogUpdate()
  const { deleteBlogPost } = useBlogDelete()
  const utils = useBlogUtils()
  const view = useBlogInterface()

  return {
    items,
    fetchBySlug,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    utils,
    view,
  }
}
```

**Model**
- `packages/extensions/fireux-blogs/src/runtime/models/blog/post.model.ts`

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
  cta_text: string // ← new
  type: 'article' | 'product'
  product_id?: string
  appId: string
}

// ------------------------------------------------------------------
// Entry type: exactly what the user fills in
// ------------------------------------------------------------------
export type BlogPostEntry = Omit<
  BlogPost,
  'created_at' | 'updated_at' | 'appId'
>

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

---

## C) Product (fireux-products)

**Root composable**
- `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProducts.ts`

**Tree**
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProducts.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/Prices/useCreatePricesState.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/utils/useProductFormatting.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/utils/useProductValidation.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/fetch/useProductBySlug.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/fetch/useProductPrices.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/fetch/useProductRead.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/fetch/useProductCollection.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProductUtils.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProductCreate.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProductUpdate.ts
- packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProductDelete.ts

**useProducts.ts**
```ts
import type {
  FirebaseProduct,
  Price,
} from '#fireux-products/models/objects/product.model.ts'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useProductCreate } from './useProductCreate.ts'
import { useProductUpdate } from './useProductUpdate.ts'
import { useProductDelete } from './useProductDelete.ts'

export function useProducts() {
  const {
    firestoreFetchCollection,
    firestoreFetchDoc,
    firestoreQueryOneByField,
    getCollectionPath,
    firestoreFetchSubcollection,
  } = useFirestoreManager()

  const collectionPath = getCollectionPath('products')
  const productsCollection =
    firestoreFetchCollection<FirebaseProduct>(collectionPath)

  const fetchProduct = (id: string) =>
    firestoreFetchDoc<FirebaseProduct>(collectionPath, id)

  const fetchProductBySlug = (slug: string) =>
    firestoreQueryOneByField<FirebaseProduct>('products', 'slug', slug, true)

  const fetchProductPrices = async (productId: string): Promise<Price[]> => {
    if (!productId) return []
    const collectionName = getCollectionPath('products')
    return firestoreFetchSubcollection<Price>(
      collectionName,
      productId,
      'prices'
    )
  }

  const formatPrice = ({
    unit_amount,
    currency,
  }: {
    unit_amount: number
    currency?: string
  }): string => {
    const amount = Number(unit_amount ?? 0)
    const iso = (currency || 'USD').toUpperCase()
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: iso,
    }).format(amount / 100)
  }

  const productCreate = useProductCreate()
  const productUpdate = useProductUpdate()
  const productDelete = useProductDelete()

  return {
    productsCollection,
    fetchProduct,
    fetchProductBySlug,
    fetchProductPrices,
    formatPrice,
    ...productCreate,
    ...productUpdate,
    ...productDelete,
  }
}
```

**Model**
- `packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts`

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
  product_type?: 'physical' | 'digital' | 'service'
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
  product_type?: 'physical' | 'digital' | 'service'
  track_stock?: boolean
  main_image?: string
  appId?: string
  creator_id?: string
}

export type ProductId = Product['id']
```

---

## D) Kitchen (fireux-misebox)

**Root composable**
- `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/kitchen/useKitchens.ts`

**Tree**
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/kitchen/useKitchenCreate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/kitchen/useKitchenDelete.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/kitchen/useKitchenUpdate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/kitchen/useKitchenCreation.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/kitchen/useKitchens.ts

**useKitchens.ts**
```ts
import { computed } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import type { Kitchen, KitchenCard } from '../../../../models/Kitchen.model'

const COLLECTION_PATH = 'kitchens'

type KitchenFirestoreDoc = Partial<Kitchen> & {
  id?: string
  place_id?: string
  appId?: string | null
}

function mapKitchen(
  raw: KitchenFirestoreDoc,
  fallbackId?: string
): Kitchen | null {
  const id = raw.id || raw.place_id || fallbackId
  if (!id) return null

  const resolvedAppId = raw.app_id ?? raw.appId ?? null

  return {
    id,
    name: raw.name ?? 'Untitled kitchen',
    description: raw.description || undefined,
    app_id: resolvedAppId,
  }
}

function toCell(kitchen: Kitchen): KitchenCard.Cell {
  return {
    id: kitchen.id,
    name: kitchen.name,
    app_id: kitchen.app_id ?? null,
  }
}

// Unified Firestore-backed kitchens collection helpers
export function useKitchens() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const rawCollection =
    firestoreFetchCollection<KitchenFirestoreDoc>(COLLECTION_PATH)

  const kitchens = computed<Kitchen[]>(() => {
    const values = rawCollection.value ?? []
    return values
      .map((entry) => mapKitchen(entry))
      .filter((entry): entry is Kitchen => entry !== null)
  })

  const kitchenCells = computed<KitchenCard.Cell[]>(() =>
    kitchens.value.map((kitchen) => toCell(kitchen))
  )

  function useKitchenDoc(id: string) {
    return firestoreFetchDoc<KitchenFirestoreDoc>(COLLECTION_PATH, id)
  }

  function useKitchen(id: string) {
    const docRef = useKitchenDoc(id)
    return computed<Kitchen | null>(() => {
      const value = docRef.value
      if (value === undefined || value === null) return null
      return mapKitchen(value, id)
    })
  }

  const isLoaded = computed(() => rawCollection.value !== undefined)

  return {
    rawCollection,
    kitchens,
    kitchenCells,
    useKitchen,
    useKitchenDoc,
    isLoaded,
  }
}
```

**Model**
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/kitchen.model.ts`

```ts
/**
 * Kitchen Model (Misebox)
 * Minimal Firestore shape — id matches place_id.
 */

export interface Kitchen {
  /** Same as place_id (1:1 mapping with Places) */
  id: string
  name: string
  description?: string
  app_id?: string | null
}

/* ---------------------------
 * UI Card View Models (strict)
 * --------------------------- */
export namespace KitchenCard {
  /** Tiny badge-style */
  export interface Pill {
    id: string
    name: string
  }

  /** Mid-size list row */
  export interface Cell {
    id: string
    name: string
    app_id?: string | null
  }

  /** Full profile panel */
  export interface Profile {
    id: string
    name: string
    description?: string
    app_id?: string | null
  }
}
```

---

## E) Recipe (fireux-misebox)

**Root composable**
- `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/Recipe/useRecipes.ts`

**Tree**
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/Recipe/useRecipeDelete.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/Recipe/useRecipeUpdate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/Recipe/useRecipeCreate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/Recipe/useRecipes.ts

**useRecipes.ts**
```ts
import { computed } from 'vue'
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'
import { useRecipeCreate } from './useRecipeCreate'
import { useRecipeUpdate } from './useRecipeUpdate'
import { useRecipeDelete } from './useRecipeDelete'

export function useRecipes() {
  const db = useFirestore()
  const colRef = collection(db, 'recipes')
  const q = query(colRef, orderBy('name'))
  const { data } = useCollection(q)

  // Transform raw firestore data to proper recipe format
  const all = computed(() => {
    if (!data.value) return []
    return data.value.map((raw: any) => ({
      id: raw.id || 'unknown',
      name: raw.name || 'Untitled Recipe',
      ...raw,
    }))
  })

  const create = useRecipeCreate()
  const update = useRecipeUpdate()
  const deleteRecipe = useRecipeDelete()

  return { all, ...create, ...update, ...deleteRecipe }
}
```

**Model(s)**
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/Recipe.model.ts`
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/RecipeSimple.model.ts`

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

---

## F) Ingredient (fireux-misebox)

**Root composable**
- `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/ingredient/useIngredient.ts`

**Tree**
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/ingredient/useIngredientCreate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/ingredient/useIngredient.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/ingredient/useIngredientFilters.ts

**useIngredient.ts**
```ts
import { computed, ref } from 'vue'
import { useFirestore, useCollection, useDocument } from 'vuefire'
import { collection, query, orderBy, doc } from 'firebase/firestore'
import { useIngredientCreate } from './useIngredientCreate'
import { normalizeIngredient } from '../../../../models/objects/Ingredient.model'

// Simple firestore collection fetch - just ingredients
export function useIngredient() {
  try {
    const db = useFirestore()
    if (!db) {
      // Fallback if firestore is not available (SSR)
      return {
        all: ref([]),
        getById: (id: string) => ref(null),
        ...useIngredientCreate(),
      }
    }

    const colRef = collection(db, 'ingredients')
    const q = query(colRef, orderBy('name'))

    const { data, pending, error } = useCollection(q, { ssrKey: 'ingredients' })

    // Transform raw firestore data to normalized ingredient format
    const all = computed(() => {
      if (!data.value || pending.value || error.value) return []
      return data.value.map((raw: any) =>
        normalizeIngredient(raw.id || 'unknown', raw)
      )
    })

    // Get single ingredient by ID
    const getById = (id: string) => {
      const docRef = doc(db, 'ingredients', id)
      const { data: rawData } = useDocument(docRef, {
        ssrKey: `ingredient-${id}`,
      })

      return computed(() => {
        if (!rawData.value) return null
        return normalizeIngredient(id, rawData.value)
      })
    }

    const create = useIngredientCreate()

    return {
      all,
      pending,
      error,
      getById,
      ...create,
    }
  } catch (err) {
    console.warn('useIngredient error:', err)
    return {
      all: ref([]),
      pending: ref(false),
      error: ref(err),
      getById: (id: string) => ref(null),
      ...useIngredientCreate(),
    }
  }
}
```

**Model**
- `packages/ecosystem/fireux-misebox/src/runtime/models/objects/Ingredient.model.ts`

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

---

## Cross-check notes (alignment questions)

This snapshot highlights that we already have **multiple “canons in practice”**:
- **Facade pattern with `fetch/` + `mutations/` + `utils/`**: Blogs, Companies
- **Single-file facade that inlines fetch + helpers + composes mutations**: Products
- **Single-file facade that inlines mapping/projection**: Kitchens
- **VueFire-direct pattern (no core FirestoreManager usage)**: Recipes, Ingredients

Model placement also varies:
- `models/objects/*` (Products, Misebox Recipe/Ingredient)
- `models/blog/*` (Blogs)
- `models/*.model.ts` at package root (Companies, Kitchens)

If we want a strict repo-wide canon, we need to explicitly decide:
1) Do **all objects** require a `useX` facade + `fetch/` + `mutations/`?
2) Do **all objects** use `useFirestoreManager` (or `useFirestoreRead/Create/Update`) instead of raw VueFire?
3) Canonical model path: `models/objects/<thing>.model.ts` vs `models/<thing>.model.ts` vs domain folders (`models/blog/*`).
4) Local “draft/state before Firestore” pattern: today it exists at least in Products (state modules) but isn’t expressed uniformly.
