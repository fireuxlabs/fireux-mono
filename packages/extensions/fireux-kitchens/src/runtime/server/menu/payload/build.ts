import { createError } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import type { KitchenOrderType } from '../../../models/kitchen/order.model'
import type {
  MenuDetailPayload,
  MenuDocumentFileKind,
  MenuManifest,
} from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuChoice, MenuOrderTypeConfig } from '../../../models/kitchen/menu/menu.model'
import { readMenuOrderingConfig, isMenuOrderingEnabled } from '../ordering/config.ts'
import {
  menuContextProfile,
  normalizeMenuRouteContext,
} from '../../../utils/menu-context.ts'
import {
  compactMenuFile,
  hasMenuFile,
  menuFileKind,
  readMenuDocumentKind,
  readMenuFile,
} from './file.ts'
import { readMenuPageStyle } from './page-style.ts'
import { readMenuKioskSkin } from './kiosk-skin.ts'
import { readMenuManifestSections } from './sections.ts'
import { menuSourceFromData } from './source.ts'
import {
  type MenuPayloadScope,
  type MenuPayloadSource,
  type MenuPayloadSourceKind,
} from './types.ts'

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const unique = <T extends string>(values: T[]) =>
  values.filter((value, index, source) => source.indexOf(value) === index)
const kitchenImageShade = (value: unknown) => {
  const shade = text(value)
  return shade === 'light' || shade === 'dark' ? shade : undefined
}

const readMenuSourceKind = (data: Record<string, unknown>): MenuPayloadSourceKind =>
  readRecordString(data, 'source_kind') === 'kitchen-menu' ||
  readRecordString(data, 'kind') === 'menu'
    ? 'menu'
    : 'doc'

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
  const ordering = sourceMenu.ordering ?? rootMenuData.ordering
  const kioskSkinId = sourceMenu.kiosk_skin_id ?? rootMenuData.kiosk_skin_id

  return {
    ...rootMenuData,
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    ...(status ? { status } : {}),
    ...(ordering ? { ordering } : {}),
    ...(kioskSkinId ? { kiosk_skin_id: kioskSkinId } : {}),
  }
}

export async function readMenuSourceMenu(source: MenuPayloadSource) {
  if (!source.app_id || !source.kitchen_id || !source.menu_id) return {}

  const snap = await getRuntimeFirestore()
    .collection(`apps/${source.app_id}/kitchens/${source.kitchen_id}/menus`)
    .doc(source.menu_id)
    .get()
  if (!snap.exists) return {}

  const data = snap.data() || {}
  return readRecordString(data, 'status') === 'published' ? data : {}
}

const defaultOrderType = (
  types: KitchenOrderType[],
  contextValue: unknown
) => {
  if (!types.length) return undefined

  const profile = menuContextProfile(contextValue)
  const preferred = profile.defaultOrderType
  const visibleTypes = profile.visibleOrderTypes.filter((type) =>
    types.includes(type)
  )

  if (preferred && visibleTypes.includes(preferred)) return preferred

  return visibleTypes[0] ||
    (profile.context !== 'generic' ? preferred || profile.visibleOrderTypes[0] : types[0]) ||
    'dine_in'
}

const contextOrderTypeConfigs = (
  ordering: ReturnType<typeof readMenuOrderingConfig>,
  contextValue: unknown
) => {
  const profile = menuContextProfile(contextValue)

  return ordering.order_types.filter((type) =>
    profile.visibleOrderTypes.includes(type.type)
  )
}

const contextChoices = (
  choices: MenuChoice[],
  contextValue: unknown
) => {
  const profile = menuContextProfile(contextValue)

  return choices.filter((choice) =>
    choice.order_type && (
      profile.context === 'generic' ||
      profile.visibleOrderTypes.includes(choice.order_type)
    )
  )
}

const serviceProfile = (
  data: Record<string, unknown>,
  scope: MenuPayloadScope
) => {
  const ordering = readMenuOrderingConfig(
    data,
    scope.fulfilment,
    scope.kitchen_operation_hours
  )
  const context = normalizeMenuRouteContext(scope.menuContext)
  const orderTypeConfigs = contextOrderTypeConfigs(ordering, context)
  const availableOrderTypes = unique(ordering.order_types.map((type) => type.type))
  const orderTypes = unique(orderTypeConfigs.map((type) => type.type))
  const contextOrdering = {
    ...ordering,
    enabled: ordering.enabled && orderTypeConfigs.length > 0,
    order_types: orderTypeConfigs,
    ...(context === 'generic'
      ? {}
      : {
          service_hours: orderTypeConfigs[0]?.service_hours,
        }),
  }
  const defaultType = defaultOrderType(orderTypes, context)
  const choices = Array.isArray(scope.choices)
    ? scope.choices as MenuChoice[]
    : []

  return {
    context,
    surface: menuContextProfile(context).surface,
    ordering: contextOrdering,
    orderingEnabled: isMenuOrderingEnabled(contextOrdering),
    orderTypes,
    availableOrderTypes,
    ...(defaultType
      ? {
          defaultOrderType: defaultType,
          defaultOrderTypeConfig:
            contextOrdering.order_types.find((type: MenuOrderTypeConfig) =>
              type.type === defaultType
            ),
        }
      : {}),
    choices: contextChoices(choices, context),
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
  const imageShade = kitchenImageShade(scope.kitchenImageShade)
  const kioskSkinId = readRecordString(menuData, 'kiosk_skin_id')
  const kioskSkin = await readMenuKioskSkin(source.app_id, kioskSkinId)
  if (!currencyCode) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Kitchen currency code is required before publishing menus.',
    })
  }

  const manifest: MenuManifest = {
    content: {
      id: menuId,
      name: readRecordString(menuData, 'name') || menuId,
      description: readRecordString(menuData, 'description'),
      sections: readMenuManifestSections(scope.sections ?? []),
    },
    behaviour: serviceProfile(menuData, scope),
    presentation: {
      currencyCode,
      currencyFormat: scope.currencyFormat || 'dash',
      showCurrency: scope.showCurrency !== false,
      ...(imageShade ? { kitchenImageShade: imageShade } : {}),
      ...(text(scope.kitchenImageUrl)
        ? { kitchenImageUrl: text(scope.kitchenImageUrl) }
        : {}),
      ...(text(scope.kitchenLogoImageUrl)
        ? { kitchenLogoImageUrl: text(scope.kitchenLogoImageUrl) }
        : {}),
      kitchenName: source.kitchen_name || '',
      ...(text(scope.kitchenWordmarkImageUrl)
        ? { kitchenWordmarkImageUrl: text(scope.kitchenWordmarkImageUrl) }
        : {}),
      ...(kioskSkin
        ? {
            kioskSkin,
            kioskSkinId,
          }
        : {}),
      pageStyle: readMenuPageStyle(scope.page_style),
    },
    source: {
      appId: source.app_id || '',
      kitchenId: source.kitchen_id || '',
      menuId: source.menu_id || menuId,
      kitchenSlug: source.kitchen_slug || '',
    },
  }

  return {
    kind: 'manifest',
    manifest,
  }
}

export function buildMenuDocumentPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): MenuDetailPayload {
  const file = readMenuFile(data)
  const source = menuSourceFromData(data, scope)
  const imageShade = kitchenImageShade(scope.kitchenImageShade)
  const fileKind = menuFileKind({
    file,
    storedKind: readMenuDocumentKind(data),
  }) as MenuDocumentFileKind

  return {
    kind: 'document',
    document: {
      id: menuId,
      name: readRecordString(data, 'name') || menuId,
      description: readRecordString(data, 'description'),
      ...(text(scope.currencyCode)
        ? { currencyCode: text(scope.currencyCode) }
        : {}),
      currencyFormat: scope.currencyFormat || 'dash',
      showCurrency: scope.showCurrency !== false,
      ...(imageShade ? { kitchenImageShade: imageShade } : {}),
      ...(text(scope.kitchenImageUrl)
        ? { kitchenImageUrl: text(scope.kitchenImageUrl) }
        : {}),
      ...(text(scope.kitchenLogoImageUrl)
        ? { kitchenLogoImageUrl: text(scope.kitchenLogoImageUrl) }
        : {}),
      kitchenName: source.kitchen_name || '',
      ...(text(scope.kitchenWordmarkImageUrl)
        ? { kitchenWordmarkImageUrl: text(scope.kitchenWordmarkImageUrl) }
        : {}),
      fileKind,
      ...(hasMenuFile(file) ? { file: compactMenuFile(file) } : {}),
      pageStyle: readMenuPageStyle(scope.page_style),
    },
  }
}

export async function buildMenuPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): Promise<MenuDetailPayload> {
  const sourceKind = scope.sourceKind === 'kitchen-menu'
    ? 'menu'
    : scope.sourceKind ?? readMenuSourceKind(data)

  return sourceKind === 'menu'
    ? await buildMenuManifestPayload(menuId, data, scope)
    : buildMenuDocumentPayload(menuId, data, scope)
}
