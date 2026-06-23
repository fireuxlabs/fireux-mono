import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { menuSourceFromData } from './menu-surface-source.ts'

export type MenuKitchenScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  createdByLabel?: string
}

export const kitchenDisplayName = (data: Record<string, unknown>) =>
  readRecordString(data, 'display_name') ||
  readRecordString(data, 'name') ||
  readRecordString(data, 'short_name')

export const resolveSourceAppId = (
  kitchenData: Record<string, unknown>,
  fallbackAppId: string
) => readRecordString(kitchenData, 'app_scope_app_id') || fallbackAppId

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

  return {
    kitchenId: resolvedKitchenId,
    kitchenSlug: resolvedKitchenSlug,
    kitchenName: kitchenDisplayName(kitchenData),
    kitchenAppId:
      source.app_id ||
      resolveSourceAppId(kitchenData, currentAppId),
    kitchenMenuId: source.menu_id || '',
    createdByLabel: '',
  }
}
