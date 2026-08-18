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
import { MenuStorage } from '../../../models/menu.model.ts'

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

const scopedMenuSource = (collectionPath: string, menuId: string) => {
  const match = clean(collectionPath).match(/^apps\/([^/]+)\/kitchens\/([^/]+)\/menus$/)
  if (!match) throw new Error(`Invalid scoped menu collection path: ${collectionPath}`)

  return { app_id: match[1], kitchen_id: match[2], menu_id: clean(menuId) }
}

export const menuRootEntryPatch = (data: Record<string, unknown>) => {
  const patch: Record<string, unknown> = {}
  if (hasOwn(data, 'name')) patch.name = clean(data.name)
  if (hasOwn(data, 'description')) patch.description = clean(data.description)
  if (hasOwn(data, 'status')) patch.status = clean(data.status)

  return patch
}

export const menuRootEntryPatchFromSourceMenu = (
  input: MenuRootEntryFromSourceInput
) => ({
  ...menuRootEntryPatch(input.data),
  source: scopedMenuSource(input.scopedMenuCollectionPath, input.menuId),
})

export const menuRootEntryMergePatchFromSourceMenu = (
  input: MenuRootEntryFromSourceInput
) => ({
  ...menuRootEntryPatch(input.data),
  source: scopedMenuSource(input.scopedMenuCollectionPath, input.menuId),
})

export const menuRootEntrySourceIsCurrent = (
  data: Record<string, unknown>,
  input: {
    scopedMenuCollectionPath: string
    menuId: string
  }
) => {
  const source = record(data.source)
  const expected = scopedMenuSource(input.scopedMenuCollectionPath, input.menuId)

  return clean(source.app_id) === expected.app_id &&
    clean(source.kitchen_id) === expected.kitchen_id &&
    clean(source.menu_id) === expected.menu_id
}

export const menuRootEntryId = (menuId: unknown) => kebabIdentifier(menuId)

export const menuRootEntryIdentifierPatch = (rootMenuId: string) => ({
  id: rootMenuId,
})


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
