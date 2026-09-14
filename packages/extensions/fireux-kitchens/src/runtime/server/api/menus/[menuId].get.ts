import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { createError, getQuery, getRouterParam } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import {
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli'
import { buildMenuPayload } from '../../../menu/server/payload/build.ts'
import { menuSourceFromData } from '../../../menu/server/payload/source.ts'
import { readKitchenMenuSections } from '../../../menu/server/manifest/sections.ts'
import { readKitchenMenuChoices } from '../../../menu/server/manifest/choices.ts'
import { readMenuManifestSections } from '../../../menu/server/payload/sections.ts'
import {
  menuSpecialsContent,
  shouldEmbedMenuSpecials,
} from '../../../menu/utils/menu-specials.ts'
import { normalizeMenuRouteContext } from '../../../menu/utils/menu-context.ts'
import { parseMenuRouteTarget } from '../../../kitchen/utils/kitchen-menu-route.ts'
import {
  resolveMenuTarget,
  type RootMenuTarget,
  type ScopedMenuTarget,
} from '../../../menu/server/ownership/target.ts'
import { requireKitchenKioskSession } from '../../../kitchen/server/operations/kiosks/session.ts'

const text = (value: unknown) => String(value ?? '').trim()

async function readSpecialsContent(target: ScopedMenuTarget | RootMenuTarget) {
  const primaryMenuId = text(target.scope.primaryMenuId)
  const specialsMenuId = text(target.scope.specialsMenuId)
  if (
    !shouldEmbedMenuSpecials({
      sourceMenuId: target.sourceMenuId,
      primaryMenuId,
      specialsEnabled: target.scope.specialsEnabled,
      specialsMenuId,
    })
  )
    return undefined

  const data = await getRuntimeFirestore()
    .doc(`kitchens/${target.kitchenId}/menus/${specialsMenuId}`)
    .get()
  if (
    !data.exists ||
    readRecordString(data.data() || {}, 'status') !== 'published'
  ) {
    return undefined
  }
  const sections = await readKitchenMenuSections(getRuntimeFirestore(), {
    appId: target.appId,
    kitchenId: target.kitchenId,
    menuId: specialsMenuId,
  })
  const menu = data.data() || {}
  return menuSpecialsContent({
    id: specialsMenuId,
    name: readRecordString(menu, 'name') || 'Daily Specials',
    description: readRecordString(menu, 'description'),
    sections: readMenuManifestSections(sections),
  })
}

type MenuRequestError = {
  status?: number
  statusCode?: number
  data?: {
    status?: number
    statusCode?: number
  }
}

function menuRequestStatusCode(value: unknown) {
  const error = value as MenuRequestError
  const statusCode = Number(
    error?.statusCode ||
      error?.status ||
      error?.data?.statusCode ||
      error?.data?.status ||
      500
  )

  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : 500
}

function safeMenuError(value: unknown) {
  const statusCode = menuRequestStatusCode(value)
  const statusMessage =
    statusCode === 404
      ? 'Menu not found.'
      : statusCode >= 500
        ? 'Menu temporarily unavailable.'
        : 'Menu unavailable.'

  return createError({ statusCode, statusMessage })
}

async function readKitchenMenu(
  target: ScopedMenuTarget,
  menuContext: ReturnType<typeof normalizeMenuRouteContext>,
  sproochliLanguage: SproochliLanguageCode
) {
  const db = getRuntimeFirestore()
  const data = target.menuData
  const [sections, choices, specials] = await Promise.all([
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
    readSpecialsContent(target),
  ])

  return await buildMenuPayload(target.routeMenuId, data, {
    ...target.scope,
    sourceKind: readRecordString(data, 'source_kind') || 'kitchen-menu',
    menuContext,
    sproochliLanguage,
    sections,
    choices,
    specials,
  })
}

async function readRootMenuDetail(
  target: RootMenuTarget,
  menuContext: ReturnType<typeof normalizeMenuRouteContext>,
  sproochliLanguage: SproochliLanguageCode
) {
  const db = getRuntimeFirestore()
  const data = target.rootMenuData
  const kitchenScope = target.scope
  const source = menuSourceFromData(data, kitchenScope)
  const sourceMenu = target.sourceMenuData
  const hasKitchenSource = Boolean(
    source.app_id && source.kitchen_id && source.menu_id
  )
  const [sourceSections, choices, specials] = await Promise.all([
    hasKitchenSource
      ? readKitchenMenuSections(db, {
          appId: source.app_id || '',
          kitchenId: source.kitchen_id || '',
          menuId: source.menu_id || '',
        })
      : [],
    hasKitchenSource && source.kitchen_slug
      ? readKitchenMenuChoices(db, {
          appId: source.app_id || '',
          kitchenId: source.kitchen_id || '',
          kitchenSlug: source.kitchen_slug,
          currentMenuId: source.menu_id || '',
        })
      : [],
    hasKitchenSource ? readSpecialsContent(target) : undefined,
  ])

  return await buildMenuPayload(target.routeMenuId, data, {
    ...kitchenScope,
    sourceMenu,
    menuContext,
    sproochliLanguage,
    sections: sourceSections,
    choices,
    specials,
  })
}

export default defineLiveReadHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET'],
  })

  try {
    const routeTarget = parseMenuRouteTarget(getRouterParam(event, 'menuId'))
    const query = getQuery(event)
    const menuId = routeTarget.menuId
    const kitchenSlug = text(query.kitchenSlug)
    const menuContext = Object.hasOwn(query, 'context')
      ? normalizeMenuRouteContext(query.context)
      : routeTarget.context
    const sproochliLanguage = normalizeSproochliLanguage(query.sproochli)

    if (!menuId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Menu path is required.',
      })
    }

    const target = await resolveMenuTarget(menuId, kitchenSlug)
    if (menuContext === 'kiosk') {
      await requireKitchenKioskSession(event, {
        appId: target.appId,
        kitchenId: target.kitchenId,
        menuId: target.sourceMenuId,
      })
    }
    if (target.kind !== 'root-doorway') {
      return await readKitchenMenu(target, menuContext, sproochliLanguage)
    }

    return await readRootMenuDetail(target, menuContext, sproochliLanguage)
  } catch (error) {
    throw safeMenuError(error)
  }
})
