import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { menuSourceFromData } from './menu-surface-source.ts'
import { readMenuPageStyle } from './menu-page-style.ts'

export type MenuKitchenScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  createdByLabel?: string
  page_style?: Record<string, unknown>
}

export const kitchenDisplayName = (data: Record<string, unknown>) =>
  readRecordString(data, 'display_name') ||
  readRecordString(data, 'name') ||
  readRecordString(data, 'short_name')

export const resolveSourceAppId = (
  kitchenData: Record<string, unknown>,
  fallbackAppId: string
) => readRecordString(kitchenData, 'app_scope_app_id') || fallbackAppId

const hasValues = (value: Record<string, unknown>) =>
  Object.keys(value).length > 0

export async function readAppMenuKitchenData(
  appId: string,
  kitchenId: string
) {
  if (!appId || !kitchenId) return {}

  const snap = await getRuntimeFirestore()
    .collection(`apps/${appId}/kitchens`)
    .doc(kitchenId)
    .get()

  return snap.exists ? snap.data() || {} : {}
}

export function menuKitchenIdentity(
  rootData: Record<string, unknown>,
  appData: Record<string, unknown> = {}
) {
  const appPageStyle = readMenuPageStyle(appData.menu_style)
  const rootPageStyle = readMenuPageStyle(rootData.menu_style)

  // Public menu identity spine: app-scoped kitchen identity wins, root kitchen stays the public-directory fallback.
  return {
    name: kitchenDisplayName(appData) || kitchenDisplayName(rootData),
    page_style: hasValues(appPageStyle) ? appPageStyle : rootPageStyle,
  }
}

export async function readMenuKitchenBySlug(kitchenSlug: string) {
  const snap = await getRuntimeFirestore()
    .collection('kitchens')
    .where('slug', '==', kitchenSlug.toLowerCase())
    .limit(1)
    .get()
  const doc = snap.docs[0]

  if (!doc) return null

  return {
    id: doc.id,
    data: doc.data() || {},
  }
}

export async function readRootMenuKitchenScope(
  data: Record<string, unknown>,
  currentAppId: string
): Promise<MenuKitchenScope> {
  const source = menuSourceFromData(data)
  const kitchenId = source.kitchen_id || ''
  const kitchenSlug = source.kitchen_slug || ''
  if (!kitchenId && !kitchenSlug) return {}

  const db = getRuntimeFirestore()
  const snap = kitchenId
    ? await db.collection('kitchens').doc(kitchenId).get()
    : (await db
        .collection('kitchens')
        .where('slug', '==', kitchenSlug.toLowerCase())
        .limit(1)
        .get()).docs[0]

  const kitchenData = snap?.exists ? snap.data() || {} : {}
  const resolvedKitchenId = snap?.exists ? snap.id : kitchenId
  const resolvedKitchenSlug = readRecordString(kitchenData, 'slug') || kitchenSlug
  const kitchenAppId =
    source.app_id ||
    resolveSourceAppId(kitchenData, currentAppId)
  const appKitchenData = await readAppMenuKitchenData(
    kitchenAppId,
    resolvedKitchenId
  )
  const identity = menuKitchenIdentity(kitchenData, appKitchenData)

  return {
    kitchenId: resolvedKitchenId,
    kitchenSlug: resolvedKitchenSlug,
    kitchenName: identity.name,
    kitchenAppId,
    kitchenMenuId: source.menu_id || '',
    createdByLabel: '',
    page_style: identity.page_style,
  }
}
