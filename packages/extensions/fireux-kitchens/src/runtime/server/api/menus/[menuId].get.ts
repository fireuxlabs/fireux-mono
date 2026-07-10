import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
} from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import { buildMenuPayload } from '../../menu/payload/build.ts'
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
  currentPublicMenuAppId,
  resolvePublicMenuTarget,
  type RootPublicMenuTarget,
  type ScopedPublicMenuTarget,
} from '../../menu/ownership/public-target.ts'
import { resolveMenuPageStyle } from '../../menu/payload/page-style.ts'

const text = (value: unknown) => String(value ?? '').trim()

async function readKitchenMenu(
  target: ScopedPublicMenuTarget,
  menuContext: ReturnType<typeof normalizeMenuRouteContext>
) {
  const db = getRuntimeFirestore()
  const ownerAppView = await readMenuOwnerAppView({
    ownerAppId: target.appId,
    currentAppId: currentPublicMenuAppId(),
    kitchenSlug: target.kitchenSlug,
    menuId: target.sourceMenuId,
  })
  const ownerPayload = await menuSourcePayloadFromApi(
    menuOwnerAppApiTo(ownerAppView)
  )
  const {
    page_style: ownerPageStyle,
    ...ownerMenuPayload
  } = ownerPayload as Record<string, unknown>
  const data = target.menuData
  const [sections, choices] = await Promise.all([
    readKitchenMenuSections(db, {
      appId: target.appId,
      kitchenId: target.kitchenId,
      menuId: target.sourceMenuId,
    }),
    readKitchenMenuChoices(db, {
      appId: target.appId,
      kitchenId: target.kitchenId,
      kitchenSlug: target.kitchenSlug,
      currentMenuId: target.sourceMenuId,
      routeKind: target.kind,
    }),
  ])

  return await buildMenuPayload(target.routeMenuId, data, {
    ...target.scope,
    sourceKind: readRecordString(data, 'source_kind') || 'kitchen-menu',
    menuContext,
    page_style: resolveMenuPageStyle(
      { source: 'tenant-owner-api', style: ownerPageStyle },
      { source: 'app-kitchen', style: target.scope.page_style }
    ),
    sections,
    choices,
    ...ownerAppView,
    ...ownerMenuPayload,
  })
}

async function readRootMenuDetail(
  target: RootPublicMenuTarget,
  menuContext: ReturnType<typeof normalizeMenuRouteContext>
) {
  const db = getRuntimeFirestore()
  const data = target.rootMenuData
  const kitchenScope = target.scope
  const source = menuSourceFromData(data, kitchenScope)
  const ownerAppView = await readMenuOwnerAppView({
    ownerAppId: source.app_id || '',
    currentAppId: currentPublicMenuAppId(),
    kitchenSlug: source.kitchen_slug || '',
    menuId: source.menu_id || target.routeMenuId,
  })
  const ownerPayload = await menuSourcePayloadFromApi(
    menuOwnerAppApiTo(ownerAppView)
  )
  const {
    page_style: ownerPageStyle,
    ...ownerMenuPayload
  } = ownerPayload as Record<string, unknown>
  const sourceMenu = target.sourceMenuData
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

  return await buildMenuPayload(target.routeMenuId, data, {
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

  const publicTarget = await resolvePublicMenuTarget(menuId, kitchenSlug)
  if (publicTarget.kind !== 'root-doorway') {
    return readKitchenMenu(publicTarget, menuContext)
  }

  return readRootMenuDetail(publicTarget, menuContext)
})
