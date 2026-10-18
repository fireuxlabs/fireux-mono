import { dailyMenuToday } from '../../../menu/utils/daily-menu'
import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { createError, getQuery, getRouterParam } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import {
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli'
import { buildMenuPayload } from '../../../menu/server/payload/build.ts'
import { readKitchenMenuSections } from '../../../menu/server/manifest/sections.ts'
import { readKitchenMenuChoices } from '../../../menu/server/manifest/choices.ts'
import { normalizeMenuRouteContext } from '../../../menu/utils/menu-context.ts'
import { parseMenuRouteTarget } from '../../../menu/utils/menu-route.ts'
import { resolveMenuTarget } from '../../../menu/server/ownership/target.ts'
import { type ScopedMenuTarget } from '../../../menu/server/ownership/target-types.ts'

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
  sproochliLanguage: SproochliLanguageCode,
  kitchenOfferingId: string
) {
  const db = getRuntimeFirestore()
  const data = target.menuData
  const daily =
    data.schedule === 'daily'
      ? dailyMenuToday(data, target.scope.kitchenTimezone || '')
      : undefined
  const [sections, choices] = await Promise.all([
    daily && !daily.published
      ? []
      : readKitchenMenuSections(db, {
          appId: target.appId,
          kitchenId: target.kitchenId,
          menuId: target.sourceMenuId,
          date: daily?.date,
          currencyCode: target.scope.currencyCode,
        }),
    daily
      ? []
      : readKitchenMenuChoices(db, {
          appId: target.appId,
          kitchenId: target.kitchenId,
          kitchenSlug: target.kitchenSlug,
          currentMenuId: target.sourceMenuId,
          routeKind: target.kind,
          offerings: target.orderingSource?.offerings,
        }),
  ])

  return await buildMenuPayload(target.routeMenuId, data, {
    ...target.scope,
    daily,
    menuContext,
    kitchenOfferingId,
    sproochliLanguage,
    sections,
    choices,
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
    const kitchenOfferingId =
      typeof query.offering === 'string' ? text(query.offering) : ''

    if (!menuId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Menu path is required.',
      })
    }

    const target = await resolveMenuTarget(menuId, kitchenSlug)
    const content = target.menuData
    if (content.schedule === 'daily' && menuContext !== 'generic')
      throw createError({
        statusCode: 409,
        statusMessage: 'Daily Menus support browsing only.',
      })
    if (menuContext === 'kiosk')
      throw createError({
        statusCode: 410,
        statusMessage: 'Kiosk ordering is being rebuilt.',
      })
    return await readKitchenMenu(
      target,
      menuContext,
      sproochliLanguage,
      kitchenOfferingId
    )
  } catch (error) {
    throw safeMenuError(error)
  }
})
