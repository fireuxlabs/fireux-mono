import type { Firestore } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { KitchenStorage } from '../../../models/kitchen.model'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model'

type RootMenuEntryInput = {
  appId: string
  kitchenId: string
  kitchenPath: string
  menuId: string
  menuData: Record<string, unknown>
  stamp: Record<string, unknown>
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const text = (value: unknown) => String(value ?? '').trim()

const readFirst = (
  ...values: unknown[]
) => values.map(text).find(Boolean) || ''

const rootDocMatchesSource = (
  data: Record<string, unknown>,
  input: RootMenuEntryInput
) => {
  const source = record(data.source)

  return readRecordString(source, 'app_id') === input.appId &&
    readRecordString(source, 'kitchen_id') === input.kitchenId &&
    readRecordString(source, 'menu_id') === input.menuId
}

const kitchenIdentity = (
  scopedKitchen: Record<string, unknown>,
  rootKitchen: Record<string, unknown>
) => {
  const scopedIdentity = record(scopedKitchen.identity)
  const rootIdentity = record(rootKitchen.identity)
  const name = readFirst(
    scopedIdentity.display_name,
    scopedKitchen.display_name,
    scopedKitchen.name,
    rootIdentity.display_name,
    rootKitchen.display_name,
    rootKitchen.name
  )
  const slug = normalizeSlug(readFirst(
    scopedKitchen.slug,
    rootKitchen.slug,
    name
  ))
  const imageUrl = readFirst(
    scopedIdentity.image_url,
    scopedKitchen.display_image_url,
    scopedKitchen.image_url,
    rootIdentity.image_url,
    rootKitchen.display_image_url,
    rootKitchen.image_url
  )
  const imageShade = readFirst(
    scopedIdentity.image_shade,
    scopedKitchen.image_shade,
    rootIdentity.image_shade,
    rootKitchen.image_shade
  )

  return {
    name,
    slug,
    imageUrl,
    imageShade,
  }
}

async function readExistingRootMenuId(
  db: Firestore,
  input: RootMenuEntryInput
) {
  const snap = await db
    .collection(MenuStorage.rootCollection)
    .where('source.kitchen_id', '==', input.kitchenId)
    .get()
  const existing = snap.docs.find((doc) =>
    rootDocMatchesSource(doc.data(), input)
  )

  return existing?.id || ''
}

async function availableRootMenuId(
  db: Firestore,
  input: RootMenuEntryInput,
  kitchenSlug: string
) {
  const menuId = normalizeSlug(input.menuId)
  const prefixed = normalizeSlug(`${kitchenSlug}-${menuId}`)
  const firstCandidate = menuId === 'main' && prefixed ? prefixed : menuId
  const candidates = [
    firstCandidate,
    prefixed,
  ].filter(Boolean)
  let fallbackIndex = 2

  while (candidates.length < 20 && prefixed) {
    candidates.push(`${prefixed}-${fallbackIndex}`)
    fallbackIndex += 1
  }

  for (const candidate of Array.from(new Set(candidates))) {
    const snap = await db.collection(MenuStorage.rootCollection).doc(candidate).get()
    if (!snap.exists || rootDocMatchesSource(snap.data() || {}, input)) {
      return candidate
    }
  }

  return firstCandidate || prefixed || menuId
}

export async function ensureKitchenMenuRootEntry(
  db: Firestore,
  input: RootMenuEntryInput
) {
  // Root menus are route/list projections; scoped kitchen menus remain the content authority.
  const scopedKitchenSnap = await db.doc(input.kitchenPath).get()
  const rootKitchenSnap = await db
    .collection(KitchenStorage.rootCollection)
    .doc(input.kitchenId)
    .get()
  const identity = kitchenIdentity(
    scopedKitchenSnap.data() || {},
    rootKitchenSnap.data() || {}
  )
  const existingRootId = await readExistingRootMenuId(db, input)
  const rootId = existingRootId ||
    await availableRootMenuId(db, input, identity.slug)
  const path = `/menus/${encodeURIComponent(rootId)}`
  const rootRef = db.collection(MenuStorage.rootCollection).doc(rootId)
  const rootSnap = await rootRef.get()
  const rootData = rootSnap.data() || {}
  const sourcePath =
    `${input.kitchenPath}/${MenuStorage.scopeCollection}/${input.menuId}`

  await rootRef.set({
    id: rootId,
    slug: rootId,
    path,
    qr_path: `${path}/qr`,
    source_kind: 'kitchen-menu',
    source_path: sourcePath,
    status: readRecordString(input.menuData, 'status') || 'draft',
    name: readRecordString(input.menuData, 'name') || input.menuId,
    description: readRecordString(input.menuData, 'description'),
    ...(identity.imageUrl ? { image_url: identity.imageUrl } : {}),
    ...(identity.imageShade ? { image_shade: identity.imageShade } : {}),
    source: {
      app_id: input.appId,
      kitchen_id: input.kitchenId,
      kitchen_slug: identity.slug,
      kitchen_name: identity.name,
      menu_id: input.menuId,
    },
    created: record(rootData.created).at ? rootData.created : input.stamp,
    updated: input.stamp,
  }, { merge: true })

  return {
    id: rootId,
    path,
  }
}
