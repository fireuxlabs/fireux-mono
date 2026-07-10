import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { buildMenuPayload } from 'fireux-kitchens/runtime/server/menu/payload/build.ts'
import { readKitchenMenuChoices } from 'fireux-kitchens/runtime/server/menu/manifest/choices.ts'
import { readKitchenMenuSections } from 'fireux-kitchens/runtime/server/menu/manifest/sections.ts'
import { normalizeMenuRouteContext } from 'fireux-kitchens/runtime/utils/menu-context.ts'
import {
  readKitchenFulfilmentConfig,
  readKitchenOperationHours,
} from 'fireux-kitchens/runtime/utils/kitchen-spine.ts'
import kitchenConfig from '../../../app/config/kitchen.config'
import { laTapBerneMenuTheme } from '../../data/menu-theme'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async (event) => {
  const menuId = text(getRouterParam(event, 'menuId'))
  const menuContext = normalizeMenuRouteContext(getQuery(event).context)
  const fireux = (useRuntimeConfig().public?.fireux ?? {}) as Record<
    string,
    unknown
  >
  const appId = text(fireux.id)
  const kitchenId = text(kitchenConfig.kitchens[0])

  if (!appId || !kitchenId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kitchen scope is not configured.',
    })
  }

  const db = getRuntimeFirestore()
  const snap = await db.doc(`apps/${appId}/kitchens/${kitchenId}`).get()
  const menuSnap = await db
    .doc(`apps/${appId}/kitchens/${kitchenId}/menus/${menuId}`)
    .get()
  const kitchen = (snap.data() ?? {}) as Record<string, unknown>
  const menu = (menuSnap.data() ?? {}) as Record<string, unknown>
  const currencyCode = text(kitchen.currency_code).toUpperCase()
  const kitchenName =
    text((kitchen.identity as Record<string, unknown> | undefined)?.display_name) ||
    text(kitchen.display_name) ||
    text(kitchen.name) ||
    text(kitchen.short_name)
  const kitchenSlug = text(kitchen.slug)

  if (!menuSnap.exists || text(menu.status) !== 'published') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  if (!currencyCode || !kitchenName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen identity is required before publishing menus.',
    })
  }
  const sections = await readKitchenMenuSections(db, {
    appId,
    kitchenId,
    menuId,
  })
  const choices = await readKitchenMenuChoices(db, {
    appId,
    kitchenId,
    kitchenSlug,
    currentMenuId: menuId,
    routeKind: 'tenant-menu',
  })

  return buildMenuPayload(menuId, menu, {
    kitchenId,
    kitchenSlug,
    kitchenName,
    kitchenAppId: appId,
    kitchenMenuId: menuId,
    currencyCode,
    sourceKind: 'kitchen-menu',
    menuContext,
    page_style: laTapBerneMenuTheme,
    sections,
    choices,
    fulfilment: readKitchenFulfilmentConfig(kitchen),
    kitchen_operation_hours: readKitchenOperationHours(kitchen),
  })
})
