import { defineLiveProjection } from 'fireux-core/runtime/server/utils/live-projection'
import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
import { createError, getQuery, getRouterParam } from 'h3'
import { useRuntimeConfig } from '#imports'
import { dailyMenuSelection } from '../../../menu/utils/calendar/daily'

import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import {
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli'
import { buildMenuPayload } from '../../../menu/server/payload/build.ts'
import { readKitchenMenuSections } from '../../../menu/server/manifest/sections.ts'
import { readKitchenMenuChoices } from '../../../menu/server/manifest/choices.ts'
import { normalizeMenuRouteContext } from '../../../menu/utils/navigation/context.ts'
import { parseMenuRouteTarget } from '../../../menu/utils/navigation/route.ts'
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
  kitchenOfferingId: string,
  sources: LiveProjectionSources,
  browseOnly: boolean
) {
  const db = getRuntimeFirestore()
  const data = target.menuData
  const daily =
    data.schedule === 'daily'
      ? dailyMenuSelection(data, target.scope.kitchenTimezone || '')
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
          sources,
        }),
    daily || browseOnly
      ? []
      : readKitchenMenuChoices(db, {
          sources,
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
    sources,
    routeKind: target.kind,
    daily,
    menuContext,
    kitchenOfferingId,
    sproochliLanguage,
    sections,
    choices,
  })
}

export default defineLiveProjection({
  access: 'public',
  read: async (event, sources) => {
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

      const browseOnly = useRuntimeConfig(event).kitchensWorkspaceOnly === true
      if (browseOnly && (menuContext !== 'generic' || kitchenOfferingId)) {
        throw createError({ statusCode: 404, statusMessage: 'Menu not found.' })
      }
      const target = await resolveMenuTarget(
        menuId,
        kitchenSlug,
        sources,
        browseOnly
      )
      const content = target.menuData
      if (content.schedule === 'daily' && menuContext !== 'generic')
        throw createError({
          statusCode: 409,
          statusMessage: 'Daily Menus support browsing only.',
        })
      if (menuContext === 'kiosk')
        throw createError({
          statusCode: 410,
          statusMessage:
            'Per-Menu Kiosk URLs are not supported. Use the Kitchen Kiosk entrance.',
        })
      return await readKitchenMenu(
        target,
        menuContext,
        sproochliLanguage,
        kitchenOfferingId,
        sources,
        browseOnly
      )
    } catch (error) {
      throw safeMenuError(error)
    }
  },
})
