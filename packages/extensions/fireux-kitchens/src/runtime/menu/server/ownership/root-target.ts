import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { MenuStorage } from '../../utils/menu'
import { menuSourceFromData } from '../payload/source'
import {
  readMenuKitchenBySlug,
  readRootMenuKitchenScope,
} from './kitchen-scope'
import { currentMenuAppId, requireMenuAppId } from './app-scope'
import type { RootMenuTarget } from './target-types'
const text = (value: unknown) => String(value ?? '').trim()
const configurationError = (statusMessage: string) =>
  createError({ statusCode: 500, statusMessage })
const requireRootMenuKitchen = async (
  rootMenuData: Record<string, unknown>
) => {
  const source = menuSourceFromData(rootMenuData)
  const isKitchenMenu =
    readRecordString(rootMenuData, 'source_kind') === 'kitchen-menu' ||
    readRecordString(rootMenuData, 'kind') === 'menu'
  const hasSourcePointer = Boolean(
    source.app_id || source.kitchen_id || source.kitchen_slug || source.menu_id
  )

  if (!isKitchenMenu && !hasSourcePointer) return
  if ((!source.kitchen_id && !source.kitchen_slug) || !source.menu_id) {
    throw configurationError('Root menu source pointer is incomplete.')
  }

  const db = getRuntimeFirestore()
  const rootKitchen = source.kitchen_id
    ? await db.collection('kitchens').doc(source.kitchen_id).get()
    : (await readMenuKitchenBySlug(String(source.kitchen_slug)))?.snapshot

  if (!rootKitchen?.exists) {
    throw configurationError('Root menu Kitchen source was not found.')
  }

  requireMenuAppId()
}

const publishedMenuData = async (kitchenId: string, menuId: string) => {
  const snap = await getRuntimeFirestore()
    .doc(`kitchens/${kitchenId}/menus/${menuId}`)
    .get()
  const data = snap.data() || {}
  if (!snap.exists || readRecordString(data, 'status') !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  return data
}

export async function readRootMenuTarget(
  menuId: string
): Promise<RootMenuTarget> {
  const rootSnap = await getRuntimeFirestore()
    .collection(MenuStorage.rootCollection)
    .doc(menuId)
    .get()
  const rootMenuData = rootSnap.data() || {}
  if (
    !rootSnap.exists ||
    readRecordString(rootMenuData, 'status') !== 'published'
  ) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  await requireRootMenuKitchen(rootMenuData)
  const scope = await readRootMenuKitchenScope(rootMenuData, '')
  const appId = text(scope.kitchenAppId) || currentMenuAppId()
  const kitchenId = text(scope.kitchenId)
  const sourceMenuId = text(scope.kitchenMenuId)
  const sourceMenuData =
    kitchenId && sourceMenuId
      ? await publishedMenuData(kitchenId, sourceMenuId)
      : {}

  if (sourceMenuId)
    scope.kitchenMenuSlug = readRecordString(sourceMenuData, 'slug')

  return {
    kind: 'root-doorway',
    routeMenuId: menuId,
    sourceMenuId,
    appId,
    kitchenId,
    kitchenSlug: text(scope.kitchenSlug),
    rootMenuData,
    sourceMenuData,
    scope,
  }
}
