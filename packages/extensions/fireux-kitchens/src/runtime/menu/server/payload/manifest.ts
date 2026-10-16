import { readMenuPromotions } from '../../../kitchen/server/promotions/read'
import { createError } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { normalizeSproochliLanguage } from 'fireux-sproochli/runtime/sproochli'
import type {
  MenuDetailPayload,
  MenuManifest,
} from '../../models/menu-detail.model'
import { readMenuManifestSections } from './sections'
import { menuSourceFromData } from './source'
import { menuPayloadPresentation } from './presentation'
import { menuOfferingProfile } from './offering-profile'
import { resolveMenuSproochli } from '../sproochli/resolve'
import type { MenuPayloadScope } from './types'
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const sourceMenuData = (scope: MenuPayloadScope) => record(scope.sourceMenu)

const menuDataForManifest = (
  rootMenuData: Record<string, unknown>,
  scope: MenuPayloadScope
) => {
  const sourceMenu = sourceMenuData(scope)
  if (!Object.keys(sourceMenu).length) return rootMenuData

  const name = rootMenuData.name ?? sourceMenu.name
  const description = rootMenuData.description ?? sourceMenu.description
  const status = rootMenuData.status ?? sourceMenu.status

  return {
    ...rootMenuData,
    ...(sourceMenu.audience ? { audience: sourceMenu.audience } : {}),
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    ...(status ? { status } : {}),
  }
}

export async function buildMenuManifestPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): Promise<MenuDetailPayload> {
  const menuData = menuDataForManifest(data, scope)
  const source = menuSourceFromData(data, scope)
  const currencyCode = text(scope.currencyCode)
  const sproochliEnabled = scope.sproochli?.enabled === true
  if (!currencyCode) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Kitchen currency code is required before publishing menus.',
    })
  }

  const promotions = scope.daily
    ? []
    : await readMenuPromotions(
        source.kitchen_id || '',
        source.menu_id || menuId,
        scope.kitchenTimezone || '',
        currencyCode
      )
  const manifest: MenuManifest = {
    content: {
      ...(promotions.length ? { promotions } : {}),
      ...(menuData.audience === 'private_link'
        ? { audience: 'private_link' as const }
        : {}),
      id: menuId,
      name: readRecordString(menuData, 'name') || menuId,
      description: readRecordString(menuData, 'description'),
      ...(scope.daily ? { daily: scope.daily } : {}),
      sections: readMenuManifestSections(scope.sections ?? []),
    },
    behaviour: menuOfferingProfile(
      scope.daily ? { ...scope, kitchen_offerings: [], choices: [] } : scope
    ),
    presentation: {
      ...menuPayloadPresentation(menuData, scope, Boolean(source.kitchen_id)),
      currencyCode,
      ...(text(scope.placeLogoImageUrl)
        ? { placeLogoImageUrl: text(scope.placeLogoImageUrl) }
        : {}),
      ...(text(scope.placeWordmarkImageUrl)
        ? { placeWordmarkImageUrl: text(scope.placeWordmarkImageUrl) }
        : {}),
    },
    source: {
      appId: source.app_id || '',
      kitchenId: source.kitchen_id || '',
      menuId: source.menu_id || menuId,
      ...(source.menu_slug ? { menuSlug: source.menu_slug } : {}),
      kitchenSlug: source.kitchen_slug || '',
    },
  }

  return {
    kind: 'manifest',
    manifest: sproochliEnabled
      ? await resolveMenuSproochli(
          manifest,
          normalizeSproochliLanguage(scope.sproochliLanguage),
          scope.sproochli?.default_language || 'mixed'
        )
      : manifest,
  }
}
