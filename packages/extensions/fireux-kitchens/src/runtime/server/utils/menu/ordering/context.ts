import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  menuKitchenFulfilment,
  menuKitchenIdentity,
  readAppMenuKitchenData,
  readMenuKitchenBySlug,
  readRootMenuKitchenScope,
  resolveSourceAppId,
} from '../ownership/kitchen-scope.ts'
import type { MenuOrderFulfilmentPolicy } from '../../../../models/menu/menu.model.ts'

export type MenuOrderContext = {
  appId: string
  kitchenId: string
  kitchenSlug?: string
  kitchenName?: string
  menuId: string
  menuData: Record<string, unknown>
  fulfilment?: MenuOrderFulfilmentPolicy
}

const text = (value: unknown) => String(value ?? '').trim()

export const currentMenuOrderAppId = () => {
  const fireux = (useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>

  return text(fireux.id)
}

const readMenuDoc = async (
  appId: string,
  kitchenId: string,
  menuId: string
) => {
  const db = getRuntimeFirestore()
  const snap = await db
    .collection(`apps/${appId}/kitchens/${kitchenId}/menus`)
    .doc(menuId)
    .get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const menuData = snap.data() || {}
  if (readRecordString(menuData, 'status') !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  return menuData
}

export const readMenuOrderContext = async (
  menuId: string,
  kitchenSlug: string
): Promise<MenuOrderContext> => {
  if (kitchenSlug) {
    const kitchen = await readMenuKitchenBySlug(kitchenSlug)
    if (!kitchen) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }

    const appId = resolveSourceAppId(kitchen.data, currentMenuOrderAppId())
    const [menuData, appKitchenData] = await Promise.all([
      readMenuDoc(appId, kitchen.id, menuId),
      readAppMenuKitchenData(appId, kitchen.id),
    ])
    const identity = menuKitchenIdentity(kitchen.data, appKitchenData)

    return {
      appId,
      kitchenId: kitchen.id,
      kitchenSlug: readRecordString(kitchen.data, 'slug') || kitchenSlug,
      kitchenName: identity.name,
      menuId,
      menuData,
      fulfilment: menuKitchenFulfilment(kitchen.data, appKitchenData),
    }
  }

  const db = getRuntimeFirestore()
  const rootSnap = await db.collection('menus').doc(menuId).get()
  if (!rootSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const rootData = rootSnap.data() || {}
  const scope = await readRootMenuKitchenScope(rootData, currentMenuOrderAppId())
  const appId = text(scope.kitchenAppId)
  const kitchenId = text(scope.kitchenId)
  const scopedMenuId = text(scope.kitchenMenuId) || menuId
  if (!appId || !kitchenId || !scopedMenuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu cannot accept orders yet.',
    })
  }

  return {
    appId,
    kitchenId,
    kitchenSlug: text(scope.kitchenSlug),
    kitchenName: text(scope.kitchenName),
    menuId: scopedMenuId,
    menuData: await readMenuDoc(appId, kitchenId, scopedMenuId),
    fulfilment: scope.fulfilment,
  }
}
