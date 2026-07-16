import { useRuntimeConfig } from '#imports'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'
import { readKitchenAppScope } from '../../../utils/kitchen-spine.ts'
import { menuSourceFromData } from '../payload/source.ts'
import {
  menuKitchenFulfilment,
  menuKitchenIdentity,
  menuKitchenOperationHours,
  readAppMenuKitchenData,
  readMenuKitchenBySlug,
  readRootMenuKitchenScope,
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
const isFirestoreDocumentId = (value: string) =>
  Boolean(value) &&
  value !== '.' &&
  value !== '..' &&
  !value.includes('/') &&
  !(value.startsWith('__') && value.endsWith('__')) &&
  new TextEncoder().encode(value).length <= 1_500
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const strings = (value: unknown) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []
const configurationError = (statusMessage: string) => createError({
  statusCode: 500,
  statusMessage,
})

const runtimeApp = () =>
  record((useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>)

export const currentPublicMenuAppId = () => text(runtimeApp().id)

export const isTenantPublicMenuApp = () => text(runtimeApp().role) === 'tenant'

const tenantKitchenIds = () => {
  const app = runtimeApp()
  if (!isTenantPublicMenuApp()) return []

  const consoleConfig = record(app.consoleConfig)
  const kitchen = record(consoleConfig.kitchen)
  return strings(kitchen.targetIds)
}

const explicitKitchenSourceAppId = (
  kitchenData: Record<string, unknown>
) => {
  const scope = readKitchenAppScope(kitchenData)

  return scope.state === 'parent_app' || scope.state === 'tenant_app'
    ? text(scope.appId)
    : ''
}

const requireKitchenSourceAppId = (
  kitchenData: Record<string, unknown>
) => {
  const appId = explicitKitchenSourceAppId(kitchenData)
  if (appId) return appId

  throw configurationError('Kitchen menu source ownership is not configured.')
}

export async function resolveTenantPublicMenuScope(): Promise<TenantPublicMenuScope | null> {
  if (!isTenantPublicMenuApp()) return null

  const targetIds = tenantKitchenIds()
  if (targetIds.length !== 1) {
    throw configurationError(
      'Tenant menu scope must configure exactly one Kitchen target.'
    )
  }

  const kitchenId = targetIds[0] || ''

  const rootKitchenSnap = await getRuntimeFirestore()
    .collection('kitchens')
    .doc(kitchenId)
    .get()
  if (!rootKitchenSnap.exists) {
    throw configurationError('Tenant menu Kitchen target was not found.')
  }

  const rootKitchenData = rootKitchenSnap.data() || {}

  return {
    appId: requireKitchenSourceAppId(rootKitchenData),
    kitchenId,
    kitchenSlug: readRecordString(rootKitchenData, 'slug'),
    rootKitchenData,
  }
}

export async function resolveDirectoryPublicMenuScope(
  kitchenSlugValue: unknown
): Promise<TenantPublicMenuScope> {
  const kitchenSlug = text(kitchenSlugValue)
  if (!kitchenSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen path is required.',
    })
  }

  const kitchen = await readMenuKitchenBySlug(kitchenSlug)
  if (!kitchen) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen not found.',
    })
  }

  return {
    appId: requireKitchenSourceAppId(kitchen.data),
    kitchenId: kitchen.id,
    kitchenSlug: readRecordString(kitchen.data, 'slug') || kitchenSlug,
    rootKitchenData: kitchen.data,
  }
}

const requireRootMenuKitchen = async (
  rootMenuData: Record<string, unknown>
) => {
  const source = menuSourceFromData(rootMenuData)
  const isKitchenMenu =
    readRecordString(rootMenuData, 'source_kind') === 'kitchen-menu' ||
    readRecordString(rootMenuData, 'kind') === 'menu'
  const hasSourcePointer = Boolean(
    source.app_id ||
    source.kitchen_id ||
    source.kitchen_slug ||
    source.menu_id
  )

  if (!isKitchenMenu && !hasSourcePointer) return
  if ((!source.kitchen_id && !source.kitchen_slug) || !source.menu_id) {
    throw configurationError('Root menu source pointer is incomplete.')
  }

  const db = getRuntimeFirestore()
  const rootKitchen = source.kitchen_id
    ? await db.collection('kitchens').doc(source.kitchen_id).get()
    : (await db
        .collection('kitchens')
        .where('slug', '==', String(source.kitchen_slug).toLowerCase())
        .limit(1)
        .get()).docs[0]

  if (!rootKitchen?.exists) {
    throw configurationError('Root menu Kitchen source was not found.')
  }

  if (!source.app_id && !explicitKitchenSourceAppId(rootKitchen.data() || {})) {
    throw configurationError('Root menu source ownership is not configured.')
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
      kitchenImageShade: identity.imageShade,
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
  if (!isFirestoreDocumentId(menuId)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const tenantScope = await resolveTenantPublicMenuScope()
  if (tenantScope) {
    if (kitchenSlug) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu not found.',
      })
    }

    return scopedTarget('tenant-menu', menuId, {
      appId: tenantScope.appId,
      kitchenId: tenantScope.kitchenId,
      kitchenSlug: tenantScope.kitchenSlug,
      rootKitchenData: tenantScope.rootKitchenData,
    })
  }

  if (kitchenSlug) {
    const directoryScope = await resolveDirectoryPublicMenuScope(kitchenSlug)

    return scopedTarget('directory-menu', menuId, {
      appId: directoryScope.appId,
      kitchenId: directoryScope.kitchenId,
      kitchenSlug: directoryScope.kitchenSlug,
      rootKitchenData: directoryScope.rootKitchenData,
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

  await requireRootMenuKitchen(rootMenuData)
  const scope = await readRootMenuKitchenScope(
    rootMenuData,
    ''
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
