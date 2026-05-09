import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { CollectionReference, Firestore } from 'firebase-admin/firestore'
import { createError, defineEventHandler, getQuery } from 'h3'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'

type ServiceAccount = {
  project_id?: string
  projectId?: string
  client_email?: string
  private_key?: string
}

type SourceDoc = {
  id: string
  name?: string
  names?: Record<string, string>
}

const LUNA_KITCHEN_ID = 'ChIJ93_ggY-jj0cRTCyLcfBuK2w'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) =>
  normalizeString(value).replace(/_/g, '-') || 'en'
const normalizeComparable = (value: unknown) =>
  normalizeString(value)
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const normalizeList = (value: unknown) =>
  Array.isArray(value)
    ? Array.from(new Set(value.map((entry) => normalizeString(entry)).filter(Boolean)))
    : []

function findMonorepoRoot(startDir: string) {
  let dir = startDir
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function parseServiceAccountJson(raw: string): ServiceAccount | null {
  try {
    return JSON.parse(raw) as ServiceAccount
  } catch {
    return null
  }
}

async function readServiceAccountPath(pathValue: string) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue
    const parsed = parseServiceAccountJson(await readFile(candidate, 'utf8'))
    if (parsed?.project_id && parsed.client_email && parsed.private_key) {
      return parsed
    }
  }

  return null
}

async function resolveServiceAccount() {
  const inline = normalizeString(process.env.FIREBASE_SERVICE_ACCOUNT)
  if (inline) {
    const parsed = parseServiceAccountJson(inline)
    if (parsed) return parsed
  }

  const credentialPath =
    normalizeString(process.env.GOOGLE_APPLICATION_CREDENTIALS) ||
    normalizeString(process.env.FIREBASE_SERVICE_ACCOUNT_FILE) ||
    DEFAULT_SERVICE_ACCOUNT_PATH

  return readServiceAccountPath(credentialPath)
}

function getAdminDb(account: ServiceAccount) {
  const projectId = normalizeString(account.project_id || account.projectId)
  if (!projectId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase project id',
    })
  }

  const appName = `misebox-menu-prototype:${projectId}`
  const existing = getApps().find((app) => app.name === appName)
  const app = existing || initializeApp({ credential: cert(account), projectId }, appName)
  const databaseId = normalizeString(process.env.FIRESTORE_DATABASE_ID) || DEFAULT_DATABASE_ID

  return getFirestore(app, databaseId)
}

const titleFromSlug = (slug: string) =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

function cleanForJson(value: unknown): unknown {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(cleanForJson)
  if (typeof value !== 'object') return value

  const maybeTimestamp = value as { seconds?: unknown; nanoseconds?: unknown }
  if (
    typeof maybeTimestamp.seconds === 'number' &&
    typeof maybeTimestamp.nanoseconds === 'number'
  ) {
    return {
      seconds: maybeTimestamp.seconds,
      nanoseconds: maybeTimestamp.nanoseconds,
    }
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      cleanForJson(entry),
    ])
  )
}

const sourceName = (source: SourceDoc | undefined, languageCode: string) => {
  if (!source) return ''
  return normalizeString(source.names?.[languageCode]) || normalizeString(source.name)
}

function resolveSemanticLine(options: {
  dish: Record<string, unknown>
  recipesById: Map<string, SourceDoc>
  ingredientsById: Map<string, SourceDoc>
  languageCode: string
  excludedIds: string[]
  excludedTerms: string[]
}) {
  const excludedIds = new Set(options.excludedIds)
  const excludedTerms = new Set(options.excludedTerms.map(normalizeComparable))
  const names: string[] = []

  const pushSource = (id: string, source: SourceDoc | undefined) => {
    if (!id || excludedIds.has(id)) return
    const name = sourceName(source, options.languageCode)
    if (!name || excludedTerms.has(normalizeComparable(name))) return
    names.push(name)
  }

  normalizeList(options.dish.recipe_ids).forEach((id) =>
    pushSource(id, options.recipesById.get(id))
  )
  normalizeList(options.dish.ingredient_ids).forEach((id) =>
    pushSource(id, options.ingredientsById.get(id))
  )

  return names.join(', ')
}

async function resolveKitchenRef(db: Firestore, slug: string) {
  if (slug === 'luna-piccante') {
    const explicitRef = db.collection('kitchens').doc(LUNA_KITCHEN_ID)
    const explicitSnap = await explicitRef.get()
    if (explicitSnap.exists) return explicitRef
  }

  const slugSnap = await db.collection('kitchens').where('slug', '==', slug).limit(1).get()
  if (!slugSnap.empty) return slugSnap.docs[0].ref

  throw createError({
    statusCode: 404,
    statusMessage: `Kitchen not found for slug: ${slug}`,
  })
}

async function fetchDocsById(
  collectionRef: CollectionReference,
  ids: string[]
) {
  const entries: SourceDoc[] = []
  for (const id of ids) {
    const snap = await collectionRef.doc(id).get()
    if (!snap.exists) continue
    entries.push({
      id: snap.id,
      ...((snap.data() || {}) as Record<string, unknown>),
    } as SourceDoc)
  }
  return entries
}

export default defineEventHandler(async (event) => {
  const slug = normalizeString(event.context.params?.slug)
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen slug is required',
    })
  }

  const query = getQuery(event)
  const languageCode = normalizeLanguageCode(query.lang || query.language || 'en')
  const account = await resolveServiceAccount()
  if (!account) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase service-account credentials',
    })
  }

  const db = getAdminDb(account)
  const kitchenRef = await resolveKitchenRef(db, slug)
  const kitchenSnap = await kitchenRef.get()
  const kitchen = { id: kitchenSnap.id, ...(kitchenSnap.data() || {}) } as Record<string, unknown>
  const menusRef = kitchenRef.collection('menus')
  const menusSnap = await menusRef.get()
  const activeMenus = menusSnap.docs
    .map((doc) => ({ doc, data: doc.data() || {} }))
    .filter((entry) => entry.data.active === true)
    .sort((a, b) => Number(a.data.sort_order ?? 0) - Number(b.data.sort_order ?? 0))

  if (!activeMenus.length) {
    throw createError({
      statusCode: 404,
      statusMessage: `No active prototype menu for kitchen: ${slug}`,
    })
  }

  const menuSnap = activeMenus[0].doc
  const menu = { id: menuSnap.id, ...(menuSnap.data() || {}) } as Record<string, unknown>
  const rawSections = Array.isArray(menu.sections) ? menu.sections : []
  const dishIds = Array.from(
    new Set(
      rawSections.flatMap((section) =>
        Array.isArray((section as Record<string, unknown>).items)
          ? ((section as Record<string, unknown>).items as Record<string, unknown>[])
              .map((item) => normalizeString(item.dish_id))
              .filter(Boolean)
          : []
      )
    )
  )
  const dishes = await fetchDocsById(kitchenRef.collection('dishes'), dishIds)
  const dishesById = new Map(dishes.map((dish) => [dish.id, dish]))
  const recipeIds = Array.from(
    new Set(dishes.flatMap((dish) => normalizeList((dish as Record<string, unknown>).recipe_ids)))
  )
  const ingredientIds = Array.from(
    new Set(
      dishes.flatMap((dish) => normalizeList((dish as Record<string, unknown>).ingredient_ids))
    )
  )
  const recipes = await fetchDocsById(kitchenRef.collection('recipes'), recipeIds)
  const ingredients = await fetchDocsById(db.collection('ingredients'), ingredientIds)
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]))
  const ingredientsById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]))
  const sections = rawSections
    .map((section) => {
      const source = section as Record<string, unknown>
      const excludedIds = normalizeList(source.render_excluded_ids)
      const excludedTerms = normalizeList(source.render_excluded_terms)
      const items = Array.isArray(source.items)
        ? (source.items as Record<string, unknown>[])
        : []
      const entries = items
        .map((item) => {
          const dishId = normalizeString(item.dish_id)
          const dish = dishesById.get(dishId)
          if (!dish) return null

          return {
            id: normalizeString(item.id),
            dish_id: dishId,
            name: sourceName(dish, languageCode),
            semantic_line: resolveSemanticLine({
              dish,
              recipesById,
              ingredientsById,
              languageCode,
              excludedIds,
              excludedTerms,
            }),
            integrity_note: normalizeString(item.integrity_note || dish.integrity_note),
          }
        })
        .filter(Boolean)

      return {
        id: normalizeString(source.id),
        label: normalizeString(source.label),
        description: normalizeString(source.description),
        render_excluded_ids: excludedIds,
        render_excluded_terms: excludedTerms,
        entries,
      }
    })
    .filter((section) => section.entries.length > 0)

  return cleanForJson({
    route: {
      path: `/kitchen/${slug}/menu`,
      slug,
      language: languageCode,
    },
    firestore_paths: {
      kitchen: kitchenRef.path,
      menus: menusRef.path,
      menu: menuSnap.ref.path,
      dishes: kitchenRef.collection('dishes').path,
      recipes: kitchenRef.collection('recipes').path,
      ingredients: 'ingredients',
    },
    kitchen: {
      id: kitchen.id,
      name: normalizeString(kitchen.name),
      display_name: normalizeString(kitchen.name) || titleFromSlug(slug),
      slug: normalizeString(kitchen.slug),
    },
    menu,
    sections,
    dishes,
    recipes,
    ingredients,
  })
})
