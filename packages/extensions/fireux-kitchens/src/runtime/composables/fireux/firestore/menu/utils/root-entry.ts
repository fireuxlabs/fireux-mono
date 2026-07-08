import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { MenuStorage } from '../../../../../models/kitchen/menu/menu.model'

type MenuRootEntryDoc = QueryDocumentSnapshot<DocumentData>

type ReadMenuRootEntryDocsInput = {
  db: Firestore
  appId?: string | null | undefined
  kitchenId: string
  menuId?: string | null | undefined
}

type ReadStaleMenuRootEntryDocInput = ReadMenuRootEntryDocsInput & {
  scopedMenuCollectionPath: string
  menuId: string
}

type MenuRootEntryFromSourceInput = {
  scopedMenuCollectionPath: string
  menuId: string
  data: Record<string, unknown>
}

const clean = (value: unknown) => String(value ?? '').trim()
const cleanPatchText = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? clean(value) : undefined
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const hasOwn = (source: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(source, key)
const kebabIdentifier = (value: unknown) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function readPatchValue(source: Record<string, unknown>, dotted: string) {
  if (hasOwn(source, dotted)) return source[dotted]

  return dotted.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
    return (value as Record<string, unknown>)[key]
  }, source)
}

export const menuRootEntryPatch = (data: Record<string, unknown>) => {
  const patch: Record<string, unknown> = {}
  if (hasOwn(data, 'name')) patch.name = clean(data.name)
  if (hasOwn(data, 'description')) patch.description = clean(data.description)
  if (hasOwn(data, 'status')) patch.status = clean(data.status)
  if (hasOwn(data, 'ordering')) patch.ordering = data.ordering

  return patch
}

export const menuRootEntryPatchFromSourceMenu = (
  input: MenuRootEntryFromSourceInput
) => ({
  ...menuRootEntryPatch(input.data),
  'source.menu_id': clean(input.menuId),
  source_path: `${clean(input.scopedMenuCollectionPath)}/${clean(input.menuId)}`,
})

export const menuRootEntryMergePatchFromSourceMenu = (
  input: MenuRootEntryFromSourceInput & { source?: unknown }
) => ({
  ...menuRootEntryPatch(input.data),
  source: { ...record(input.source), menu_id: clean(input.menuId) },
  source_path: `${clean(input.scopedMenuCollectionPath)}/${clean(input.menuId)}`,
})

export const menuRootEntrySourceIsCurrent = (
  data: Record<string, unknown>,
  input: {
    scopedMenuCollectionPath: string
    menuId: string
  }
) => {
  const source = record(data.source)
  const menuId = clean(input.menuId)
  const sourcePath = `${clean(input.scopedMenuCollectionPath)}/${menuId}`

  return clean(source.menu_id) === menuId && clean(data.source_path) === sourcePath
}

export const menuRootEntryId = (menuId: unknown) => kebabIdentifier(menuId)

export const menuRootEntryIdentifierPatch = (rootMenuId: string) => ({
  id: rootMenuId,
})

export const menuRootEntryPatchFromKitchen = (
  data: Record<string, unknown>
) => {
  const patch: Record<string, unknown> = {}
  const displayName =
    readPatchValue(data, 'identity.display_name') ??
    readPatchValue(data, 'display_name') ??
    readPatchValue(data, 'name')
  const slug = readPatchValue(data, 'slug')
  const imageUrl =
    readPatchValue(data, 'identity.image_url') ??
    readPatchValue(data, 'display_image_url') ??
    readPatchValue(data, 'image_url')
  const imageShade =
    readPatchValue(data, 'identity.image_shade') ??
    readPatchValue(data, 'image_shade')

  const displayNameText = cleanPatchText(displayName)
  const slugText = cleanPatchText(slug)
  const imageUrlText = cleanPatchText(imageUrl)
  const imageShadeText = cleanPatchText(imageShade)

  if (displayNameText !== undefined) patch['source.kitchen_name'] = displayNameText
  if (slugText !== undefined) patch['source.kitchen_slug'] = slugText
  if (imageUrlText !== undefined) patch.image_url = imageUrlText
  if (imageShadeText !== undefined) patch.image_shade = imageShadeText

  return patch
}

export async function readMenuRootEntryDocs(
  input: ReadMenuRootEntryDocsInput
): Promise<MenuRootEntryDoc[]> {
  const kitchenId = clean(input.kitchenId)
  if (!kitchenId) return []

  const snap = await getDocs(query(
    collection(input.db, MenuStorage.rootCollection),
    where('source.kitchen_id', '==', kitchenId)
  ))
  const appId = clean(input.appId)
  const menuId = clean(input.menuId)

  return snap.docs.filter((docSnap) => {
    const source = record(docSnap.data().source)
    const sourceMenuId = clean(source.menu_id)

    return (!appId || clean(source.app_id) === appId) &&
      (!menuId || sourceMenuId === menuId || docSnap.id === menuId)
  })
}

export async function readSingleStaleMenuRootEntryDoc(
  input: ReadStaleMenuRootEntryDocInput
): Promise<MenuRootEntryDoc[]> {
  const docs = await readMenuRootEntryDocs({
    db: input.db,
    appId: input.appId,
    kitchenId: input.kitchenId,
  })
  const menuId = clean(input.menuId)
  const staleDocs: MenuRootEntryDoc[] = []

  for (const docSnap of docs) {
    const sourceMenuId = clean(record(docSnap.data().source).menu_id)
    if (!sourceMenuId || sourceMenuId === menuId) continue

    const sourceSnap = await getDoc(
      doc(input.db, clean(input.scopedMenuCollectionPath), sourceMenuId)
    )
    if (!sourceSnap.exists()) staleDocs.push(docSnap)
  }

  return staleDocs.length === 1 ? staleDocs : []
}
