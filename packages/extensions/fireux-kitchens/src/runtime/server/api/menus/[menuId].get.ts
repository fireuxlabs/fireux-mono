import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'
import {
  buildMenuPayload,
  readMenuSourceMenu,
} from '../../menu/payload/build.ts'
import { menuSourceFromData } from '../../menu/payload/source.ts'
import {
  menuOwnerAppApiTo,
  readMenuOwnerAppView,
} from '../../menu/ownership/owner-app.ts'
import { menuSourcePayloadFromApi } from '../../menu/source/payload.ts'
import { readKitchenMenuSections } from '../../menu/manifest/sections.ts'
import { readKitchenMenuChoices } from '../../menu/manifest/choices.ts'
import {
  normalizeMenuRouteContext,
  parseMenuRouteTarget,
} from '../../../utils/menu-context.ts'
import {
  menuKitchenFulfilment,
  menuKitchenIdentity,
  menuKitchenOperationHours,
  readAppMenuKitchenData,
  readMenuKitchenBySlug,
  readRootMenuKitchenScope,
  resolveSourceAppId,
} from '../../menu/ownership/kitchen-scope.ts'
import { resolveMenuPageStyle } from '../../menu/payload/page-style.ts'

const text = (value: unknown) => String(value ?? '').trim()

const currentAppId = () => {
  const fireux = (useRuntimeConfig().public?.fireux ?? {}) as Record<string, unknown>
  return text(fireux.id)
}

async function readKitchenMenu(
  menuId: string,
  kitchenSlug: string,
  menuContext: ReturnType<typeof normalizeMenuRouteContext>
) {
  const db = getRuntimeFirestore()
  const kitchen = await readMenuKitchenBySlug(kitchenSlug)

  if (!kitchen) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen not found.',
    })
  }

  const kitchenAppId = resolveSourceAppId(kitchen.data, currentAppId())
  const [appKitchenData, ownerAppView] = await Promise.all([
    readAppMenuKitchenData(kitchenAppId, kitchen.id),
    readMenuOwnerAppView({
      ownerAppId: kitchenAppId,
      currentAppId: currentAppId(),
      kitchenSlug,
      menuId,
    }),
  ])
  const ownerPayload = await menuSourcePayloadFromApi(
    menuOwnerAppApiTo(ownerAppView)
  )
  const {
    page_style: ownerPageStyle,
    ...ownerMenuPayload
  } = ownerPayload as Record<string, unknown>
  const identity = menuKitchenIdentity(kitchen.data, appKitchenData)
  const menuSnap = await db
    .collection(`apps/${kitchenAppId}/kitchens/${kitchen.id}/menus`)
    .doc(menuId)
    .get()

  if (!menuSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = menuSnap.data() || {}
  if (readRecordString(data, 'status') !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }
  const [sections, choices] = await Promise.all([
    readKitchenMenuSections(db, {
      appId: kitchenAppId,
      kitchenId: kitchen.id,
      menuId,
    }),
    readKitchenMenuChoices(db, {
      appId: kitchenAppId,
      kitchenId: kitchen.id,
      kitchenSlug,
      currentMenuId: menuId,
    }),
  ])

  return buildMenuPayload(menuId, data, {
    kitchenId: kitchen.id,
    kitchenSlug,
    kitchenName: identity.name,
    kitchenAppId,
    kitchenMenuId: menuId,
    currencyCode: identity.currencyCode,
    sourceKind: readRecordString(data, 'source_kind') || 'kitchen-menu',
    menuContext,
    page_style: resolveMenuPageStyle(
      { source: 'tenant-owner-api', style: ownerPageStyle },
      { source: 'app-kitchen', style: identity.page_style }
    ),
    sections,
    choices,
    fulfilment: menuKitchenFulfilment(kitchen.data, appKitchenData),
    kitchen_operation_hours: menuKitchenOperationHours(kitchen.data, appKitchenData),
    ...ownerAppView,
    ...ownerMenuPayload,
  })
}

async function readRootMenuDetail(
  menuId: string,
  menuContext: ReturnType<typeof normalizeMenuRouteContext>
) {
  const db = getRuntimeFirestore()
  const snap = await db.collection(MenuStorage.rootCollection).doc(menuId).get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = snap.data() || {}
  const kitchenScope = await readRootMenuKitchenScope(data, currentAppId())
  const source = menuSourceFromData(data, kitchenScope)
  const ownerAppView = await readMenuOwnerAppView({
    ownerAppId: source.app_id || '',
    currentAppId: currentAppId(),
    kitchenSlug: source.kitchen_slug || '',
    menuId: source.menu_id || menuId,
  })
  const ownerPayload = await menuSourcePayloadFromApi(
    menuOwnerAppApiTo(ownerAppView)
  )
  const {
    page_style: ownerPageStyle,
    ...ownerMenuPayload
  } = ownerPayload as Record<string, unknown>
  const sourceMenu = await readMenuSourceMenu(source)
  const [sourceSections, choices] =
    source.app_id && source.kitchen_id && source.menu_id && source.kitchen_slug
      ? await Promise.all([
          readKitchenMenuSections(db, {
            appId: source.app_id,
            kitchenId: source.kitchen_id,
            menuId: source.menu_id,
          }),
          readKitchenMenuChoices(db, {
            appId: source.app_id,
            kitchenId: source.kitchen_id,
            kitchenSlug: source.kitchen_slug,
            currentMenuId: source.menu_id,
          }),
        ])
      : [[], []]

  return buildMenuPayload(menuId, data, {
    ...kitchenScope,
    sourceMenu,
    menuContext,
    page_style: resolveMenuPageStyle(
      { source: 'tenant-owner-api', style: ownerPageStyle },
      { source: 'app-kitchen', style: kitchenScope.page_style }
    ),
    // Tenant menu dog-food spine: root and kitchen-scoped routes both let the owner API override scoped fallback sections.
    sections: sourceSections,
    ...ownerAppView,
    ...ownerMenuPayload,
    choices,
  })
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET'],
  })

  const target = parseMenuRouteTarget(getRouterParam(event, 'menuId'))
  const query = getQuery(event)
  const menuId = target.menuId
  const kitchenSlug = text(query.kitchenSlug)
  const menuContext = Object.hasOwn(query, 'context')
    ? normalizeMenuRouteContext(query.context)
    : target.context

  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  if (kitchenSlug) {
    return readKitchenMenu(menuId, kitchenSlug, menuContext)
  }

  return readRootMenuDetail(menuId, menuContext)
})
