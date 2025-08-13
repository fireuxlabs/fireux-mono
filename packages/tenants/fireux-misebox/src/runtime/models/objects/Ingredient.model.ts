/**
 * Ingredient Model (Tenant: Misebox)
 * Rich representation of an ingredient with normalization helpers.
 * Firestore currently stores a mix of snake_case and varying shapes.
 * This model standardizes to camelCase for in-app usage.
 */

// Source of the ingredient data
export type IngredientSource = 'firestore' | 'manual'

// Canonical in‑app Ingredient shape (camelCase)
export interface Ingredient {
  id: string
  name: string
  category?: string
  tags: string[]
  source?: IngredientSource
  imageUrl?: string
  createdBy: { id: string; avatar?: string }
  createdAt: string // ISO timestamp
  updatedAt?: string // ISO timestamp (may be absent on legacy docs)
}

// Raw Firestore document shape (partial & loose, snake_case tolerated)
export interface RawIngredientDoc {
  id?: string
  name?: unknown
  category?: unknown
  tags?: unknown
  created_at?: unknown
  updated_at?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  source?: unknown
  image_url?: unknown
  imageUrl?: unknown
  created_by?: unknown
  createdBy?: unknown
  // stray / malformed keys tolerated
  [key: string]: any
}

export interface NewIngredientInput {
  name: string
  category?: string
  tags?: string[]
  source?: IngredientSource
  imageUrl?: string
  createdBy: { id: string; avatar?: string }
}

/**
 * Create a normalized Ingredient (without id) from input.
 */
export function createIngredientModel(
  data: NewIngredientInput
): Omit<Ingredient, 'id'> {
  const now = new Date().toISOString()
  return {
    name: data.name.trim(),
    category: data.category?.trim() || undefined,
    tags: Array.isArray(data.tags) ? dedupeStrings(data.tags) : [],
    source: data.source,
    imageUrl: data.imageUrl,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Normalize a raw Firestore ingredient document to the canonical Ingredient shape.
 */
export function normalizeIngredient(
  id: string,
  raw: RawIngredientDoc
): Ingredient {
  const created_at = (raw.created_at || raw.createdAt) as string | undefined
  const updated_at = (raw.updated_at || raw.updatedAt) as string | undefined
  const createdByRaw = (raw.created_by || raw.createdBy) as any
  let createdBy: Ingredient['createdBy']
  if (typeof createdByRaw === 'string') {
    createdBy = { id: createdByRaw }
  } else if (createdByRaw && typeof createdByRaw === 'object') {
    createdBy = {
      id: String(createdByRaw.id || ''),
      avatar: createdByRaw.avatar,
    }
  } else {
    createdBy = { id: 'unknown' }
  }

  const tags = toStringArray(raw.tags) || []

  // Derive safe name
  let safeName = 'Ingredient'
  if (typeof raw.name === 'string') safeName = raw.name
  else if (Array.isArray(raw.name))
    safeName = raw.name.map(String).filter(Boolean).join(', ')

  // Derive category (first string if array provided)
  let category: string | undefined
  if (typeof raw.category === 'string') category = raw.category
  else if (Array.isArray(raw.category) && raw.category.length)
    category = String(raw.category[0])

  return {
    id,
    name: safeName,
    category,
    tags: dedupeStrings(tags),
    source: raw.source as IngredientSource | undefined,
    imageUrl: (raw.image_url || raw.imageUrl) as string | undefined,
    createdBy,
    createdAt: created_at || new Date().toISOString(),
    updatedAt: updated_at,
  }
}

/** Type guard */
export function isIngredient(value: any): value is Ingredient {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string'
  )
}

/** Utility: ensure array of strings */
function toStringArray(val: unknown): string[] | undefined {
  if (!val) return undefined
  if (Array.isArray(val)) return val.map((v) => String(v)).filter(Boolean)
  return undefined
}

/** Utility: deduplicate & trim */
function dedupeStrings(list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of list) {
    const t = item.trim()
    if (t && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase())
      out.push(t)
    }
  }
  return out
}

/** Prepare data for Firestore write (still camelCase for forward strategy). */
export function denormalizeIngredient(ing: Omit<Ingredient, 'id'>): any {
  return { ...ing }
}
