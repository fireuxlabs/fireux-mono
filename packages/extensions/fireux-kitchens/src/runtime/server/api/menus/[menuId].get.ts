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
import { readKitchenMenuSections } from '../../menu/manifest/sections.ts'
import { readKitchenMenuChoices } from '../../menu/manifest/choices.ts'
import {
  normalizeMenuRouteContext,
} from '../../../utils/menu-context.ts'
import { parseMenuRouteTarget } from '../../../utils/kitchen-menu-route.ts'
import {
  resolvePublicMenuTarget,
  type RootPublicMenuTarget,
  type ScopedPublicMenuTarget,
} from '../../menu/ownership/public-target.ts'

const text = (value: unknown) => String(value ?? '').trim()

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

function safePublicMenuError(value: unknown) {
  const statusCode = menuRequestStatusCode(value)
  const statusMessage = statusCode === 404
    ? 'Menu not found.'
    : statusCode >= 500
      ? 'Menu temporarily unavailable.'
      : 'Menu unavailable.'

  return createError({ statusCode, statusMessage })
}

async function readKitchenMenu(
  target: ScopedPublicMenuTarget,
  menuContext: ReturnType<typeof normalizeMenuRouteContext>
) {
  const db = getRuntimeFirestore()
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
    page_style: target.scope.page_style,
    sections,
    choices,
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
  const sourceMenu = target.sourceMenuData
  const hasKitchenSource = Boolean(
    source.app_id && source.kitchen_id && source.menu_id
  )
  const [sourceSections, choices] = await Promise.all([
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
  ])

  return await buildMenuPayload(target.routeMenuId, data, {
    ...kitchenScope,
    sourceMenu,
    menuContext,
    page_style: kitchenScope.page_style,
    sections: sourceSections,
    choices,
  })
}

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET'],
  })

  try {
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
      return await readKitchenMenu(publicTarget, menuContext)
    }

    return await readRootMenuDetail(publicTarget, menuContext)
  } catch (error) {
    throw safePublicMenuError(error)
  }
})
