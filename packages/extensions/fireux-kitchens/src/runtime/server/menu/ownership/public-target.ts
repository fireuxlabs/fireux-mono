import { useRuntimeConfig } from '#imports'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'
import {
  menuKitchenFulfilment,
  menuKitchenIdentity,
  menuKitchenOperationHours,
  readAppMenuKitchenData,
  readMenuKitchenBySlug,
  readRootMenuKitchenScope,
  resolveSourceAppId,
  type MenuKitchenScope,
} from './kitchen-scope.ts'

type ScopedTargetKind = 'tenant-menu' | 'directory-menu'

export type ScopedPublicMenuTarget = {
  kind: ScopedTargetKind
  routeMenuId: string
  sourceMenuId: string
  appId: string
  kitchenId: string
  kitchenSlug: string
  rootKitchenData: Record<string, unknown>
  appKitchenData: Record<string, unknown>
  menuData: Record<string, unknown>
  scope: MenuKitchenScope
}

export type RootPublicMenuTarget = {
  kind: 'root-doorway'
  routeMenuId: string
  sourceMenuId: string
  appId: string
  kitchenId: string
  kitchenSlug: string
  rootMenuData: Record<string, unknown>
  sourceMenuData: Record<string, unknown>
  scope: MenuKitchenScope
}

export type PublicMenuTarget = ScopedPublicMenuTarget | RootPublicMenuTarget

export type TenantPublicMenuScope = {
  appId: string
  kitchenId: string
  kitchenSlug: string
  rootKitchenData: Record<string, unknown>
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const strings = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

const runtimeApp = () =>
  record((useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>)

export const currentPublicMenuAppId = () => text(runtimeApp().id)

export const isTenantPublicMenuApp = () => text(runtimeApp().role) === 'tenant'

const tenantKitchenId = () => {
  const app = runtimeApp()
  if (!isTenantPublicMenuApp()) return ''

  const consoleConfig = record(app.consoleConfig)
  const kitchen = record(consoleConfig.kitchen)
  const targetIds = strings(kitchen.targetIds)

  return targetIds.length === 1 ? targetIds[0] : ''
}

export async function resolveTenantPublicMenuScope(): Promise<TenantPublicMenuScope | null> {
  const kitchenId = tenantKitchenId()
  if (!kitchenId) return null

  const rootKitchenSnap = await getRuntimeFirestore()
    .collection('kitchens')
    .doc(kitchenId)
    .get()
  const rootKitchenData = rootKitchenSnap.exists
    ? rootKitchenSnap.data() || {}
    : {}

  return {
    appId: resolveSourceAppId(rootKitchenData, currentPublicMenuAppId()),
    kitchenId,
    kitchenSlug: readRecordString(rootKitchenData, 'slug'),
    rootKitchenData,
  }
}

const publishedMenuData = async (
  appId: string,
  kitchenId: string,
  menuId: string
) => {
  const snap = await getRuntimeFirestore()
    .doc(`apps/${appId}/kitchens/${kitchenId}/menus/${menuId}`)
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

const scopedTarget = async (
  kind: ScopedTargetKind,
  menuId: string,
  input: {
    appId: string
    kitchenId: string
    kitchenSlug: string
    rootKitchenData: Record<string, unknown>
  }
): Promise<ScopedPublicMenuTarget> => {
  const appKitchenData = await readAppMenuKitchenData(input.appId, input.kitchenId)
  const menuData = await publishedMenuData(input.appId, input.kitchenId, menuId)
  const identity = menuKitchenIdentity(input.rootKitchenData, appKitchenData)

  return {
    kind,
    routeMenuId: menuId,
    sourceMenuId: menuId,
    appId: input.appId,
    kitchenId: input.kitchenId,
    kitchenSlug:
      input.kitchenSlug ||
      readRecordString(appKitchenData, 'slug'),
    rootKitchenData: input.rootKitchenData,
    appKitchenData,
    menuData,
    scope: {
      kitchenId: input.kitchenId,
      kitchenPlaceId:
        readRecordString(input.rootKitchenData, 'place_id') || input.kitchenId,
      kitchenImageUrl: identity.imageUrl,
      kitchenLogoImageUrl: identity.logoImageUrl,
      kitchenSlug:
        input.kitchenSlug ||
        readRecordString(appKitchenData, 'slug'),
      kitchenName: identity.name,
      kitchenWordmarkImageUrl: identity.wordmarkImageUrl,
      kitchenAppId: input.appId,
      kitchenMenuId: menuId,
      currencyCode: identity.currencyCode,
      page_style: identity.page_style,
      fulfilment: menuKitchenFulfilment(input.rootKitchenData, appKitchenData),
      kitchen_operation_hours: menuKitchenOperationHours(
        input.rootKitchenData,
        appKitchenData
      ),
    },
  }
}

export async function resolvePublicMenuTarget(
  menuIdValue: unknown,
  kitchenSlugValue?: unknown
): Promise<PublicMenuTarget> {
  const menuId = text(menuIdValue)
  const kitchenSlug = text(kitchenSlugValue)
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  if (kitchenSlug) {
    const kitchen = await readMenuKitchenBySlug(kitchenSlug)
    if (!kitchen) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }

    return scopedTarget('directory-menu', menuId, {
      appId: resolveSourceAppId(kitchen.data, currentPublicMenuAppId()),
      kitchenId: kitchen.id,
      kitchenSlug: readRecordString(kitchen.data, 'slug') || kitchenSlug,
      rootKitchenData: kitchen.data,
    })
  }

  const tenantScope = await resolveTenantPublicMenuScope()
  if (tenantScope) {
    return scopedTarget('tenant-menu', menuId, {
      appId: tenantScope.appId,
      kitchenId: tenantScope.kitchenId,
      kitchenSlug: tenantScope.kitchenSlug,
      rootKitchenData: tenantScope.rootKitchenData,
    })
  }

  const rootSnap = await getRuntimeFirestore()
    .collection(MenuStorage.rootCollection)
    .doc(menuId)
    .get()
  const rootMenuData = rootSnap.data() || {}
  if (!rootSnap.exists || readRecordString(rootMenuData, 'status') !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const scope = await readRootMenuKitchenScope(
    rootMenuData,
    currentPublicMenuAppId()
  )
  const appId = text(scope.kitchenAppId)
  const kitchenId = text(scope.kitchenId)
  const sourceMenuId = text(scope.kitchenMenuId)
  const sourceMenuData = appId && kitchenId && sourceMenuId
    ? await publishedMenuData(appId, kitchenId, sourceMenuId)
    : {}

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
