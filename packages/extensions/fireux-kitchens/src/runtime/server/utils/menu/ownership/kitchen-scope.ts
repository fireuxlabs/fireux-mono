import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  readKitchenAppScope,
  readKitchenFulfilmentConfig,
  readKitchenIdentity,
  readKitchenMenuStyle,
} from '../../../../utils/kitchen-spine'
import type { MenuOrderFulfilmentPolicy } from '../../../../models/menu/menu.model.ts'
import { menuSourceFromData } from '../public/source.ts'
import { resolveMenuPageStyle } from '../public/page-style.ts'

export type MenuKitchenScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  createdByLabel?: string
  page_style?: Record<string, unknown>
  fulfilment?: MenuOrderFulfilmentPolicy
}

export const kitchenDisplayName = (data: Record<string, unknown>) =>
  readKitchenIdentity(data).displayName

export const resolveSourceAppId = (
  kitchenData: Record<string, unknown>,
  fallbackAppId: string
) => readKitchenAppScope(kitchenData, fallbackAppId).appId

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
  const isTenantOwned = readKitchenAppScope(rootData).hasTenantApp

  // Public menu identity spine: tenant apps emit style through their API; root menu_style is only a non-tenant directory fallback.
  return {
    name: kitchenDisplayName(appData) || kitchenDisplayName(rootData),
    page_style: resolveMenuPageStyle(
      { source: 'app-kitchen', style: readKitchenMenuStyle(appData) },
      {
        source: 'root-kitchen',
        style: isTenantOwned ? {} : readKitchenMenuStyle(rootData),
      }
    ),
  }
}

export function menuKitchenFulfilment(
  rootData: Record<string, unknown>,
  appData: Record<string, unknown> = {}
) {
  const appFulfilment = readKitchenFulfilmentConfig(appData)
  if (
    appFulfilment.delivery_zones.length ||
    appFulfilment.payment_methods.length
  ) {
    return appFulfilment
  }

  return readKitchenFulfilmentConfig(rootData)
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
    fulfilment: menuKitchenFulfilment(kitchenData, appKitchenData),
  }
}
