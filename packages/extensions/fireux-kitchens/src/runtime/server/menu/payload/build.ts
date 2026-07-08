import { createError } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import type { KitchenOrderType } from '../../../models/kitchen/order.model'
import type {
  MenuDetailPayload,
  MenuDocumentFileKind,
  MenuManifest,
  MenuManifestAddOn,
  MenuManifestPriceOption,
  MenuManifestSection,
} from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuChoice, MenuOrderTypeConfig } from '../../../models/kitchen/menu/menu.model'
import { menuKioskSkinById } from '../../../models/kitchen/menu/kiosk-skin.model'
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
import { menuSourceFromData } from './source.ts'
import {
  type MenuPayloadScope,
  type MenuPayloadSource,
  type MenuPayloadSourceKind,
} from './types.ts'

const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const unique = <T extends string>(values: T[]) =>
  values.filter((value, index, source) => source.indexOf(value) === index)

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

  const name = sourceMenu.name ?? rootMenuData.name
  const description = sourceMenu.description ?? rootMenuData.description
  const status = sourceMenu.status ?? rootMenuData.status
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

const itemName = (item: Record<string, unknown>) =>
  text(item.name) || text(record(item.item).name)

const itemDescription = (item: Record<string, unknown>) =>
  text(item.description) || text(record(item.item).description)

const itemImageUrl = (item: Record<string, unknown>) =>
  text(item.imageUrl) ||
  text(item.image_url) ||
  text(record(item.item).image_url) ||
  text(record(item.dish).image_url)

const itemPriceLabel = (item: Record<string, unknown>) =>
  text(item.priceLabel) ||
  text(item.price_label) ||
  text(item.price)

const priceNumber = (value: unknown) => {
  const parsed = Number(
    text(value)
      .replace(/chf/ig, '')
      .replace(',', '.')
      .match(/\d+(?:\.\d+)?/)?.[0] || 0
  )

  return Number.isFinite(parsed) ? parsed : 0
}

const optionId = (option: Record<string, unknown>, fallback: string) =>
  text(option.id) ||
  text(option.label).toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
  fallback

const itemPriceOptions = (item: Record<string, unknown>): MenuManifestPriceOption[] =>
  list(item.priceOptions || item.price_options)
    .map((option, optionIndex) => {
      const optionRecord = record(option)
      const price = priceNumber(optionRecord.price)

      return {
        id: optionId(optionRecord, `option-${optionIndex + 1}`),
        label: text(optionRecord.label) || `Option ${optionIndex + 1}`,
        price,
        priceLabel:
          text(optionRecord.priceLabel) ||
          text(optionRecord.price_label) ||
          (price ? String(price) : ''),
      }
    })
    .filter((option) => option.label && option.priceLabel)

const itemAddOns = (item: Record<string, unknown>): MenuManifestAddOn[] =>
  list(item.addOns || item.add_ons)
    .map((option, optionIndex) => {
      const optionRecord = record(option)
      const price = priceNumber(optionRecord.price)

      return {
        id: optionId(optionRecord, `add-on-${optionIndex + 1}`),
        label: text(optionRecord.label) || `Add-on ${optionIndex + 1}`,
        price,
        priceLabel:
          text(optionRecord.priceLabel) ||
          text(optionRecord.price_label) ||
          (price ? String(price) : ''),
      }
    })
    .filter((option) => option.label && option.priceLabel)

const menuSections = (sections: unknown[]): MenuManifestSection[] =>
  sections.map((section, sectionIndex) => {
    const sectionRecord = record(section)
    const nestedSection = record(sectionRecord.section)
    const label =
      text(sectionRecord.label) ||
      text(nestedSection.label) ||
      `Section ${sectionIndex + 1}`

    return {
      id: text(sectionRecord.id) || text(nestedSection.id) || label,
      label,
      items: list(sectionRecord.items).map((item, itemIndex) => {
        const itemRecord = record(item)
        const name = itemName(itemRecord) || `Item ${itemIndex + 1}`

        return {
          id: text(itemRecord.id) || name,
          dishId: text(itemRecord.dish_id),
          name,
          description: itemDescription(itemRecord),
          imageUrl: itemImageUrl(itemRecord),
          price: priceNumber(itemRecord.price),
          priceLabel: itemPriceLabel(itemRecord),
          priceOptions: itemPriceOptions(itemRecord),
          addOns: itemAddOns(itemRecord),
        }
      }),
    }
  })

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
  types: KitchenOrderType[]
) => {
  return choices.filter((choice) =>
    choice.order_type && types.includes(choice.order_type)
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
  const orderTypes = unique(orderTypeConfigs.map((type) => type.type))
  const contextOrdering = {
    ...ordering,
    enabled: ordering.enabled && orderTypeConfigs.length > 0,
    order_types: orderTypeConfigs,
  }
  const defaultType = defaultOrderType(orderTypes, context)
  const choices = Array.isArray(scope.choices)
    ? scope.choices as MenuChoice[]
    : []

  return {
    context,
    ordering: contextOrdering,
    orderingEnabled: isMenuOrderingEnabled(contextOrdering),
    orderTypes,
    ...(defaultType
      ? {
          defaultOrderType: defaultType,
          defaultOrderTypeConfig:
            contextOrdering.order_types.find((type: MenuOrderTypeConfig) =>
              type.type === defaultType
            ),
        }
      : {}),
    choices: contextChoices(choices, orderTypes),
  }
}

export function buildMenuManifestPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): MenuDetailPayload {
  const menuData = menuDataForManifest(data, scope)
  const source = menuSourceFromData(data, scope)
  const currencyCode = text(scope.currencyCode)
  const kioskSkin = menuKioskSkinById(menuData.kiosk_skin_id)
  if (!currencyCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen currency code is required before publishing menus.',
    })
  }

  const manifest: MenuManifest = {
    content: {
      id: menuId,
      name: readRecordString(menuData, 'name') || menuId,
      description: readRecordString(menuData, 'description'),
      sections: menuSections(scope.sections ?? []),
    },
    behaviour: serviceProfile(menuData, scope),
    presentation: {
      currencyCode,
      kitchenName: source.kitchen_name || '',
      ...(kioskSkin
        ? {
            kioskSkin,
            kioskSkinId: readRecordString(menuData, 'kiosk_skin_id'),
          }
        : {}),
      pageStyle: readMenuPageStyle(scope.page_style),
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
      kitchenName: source.kitchen_name || '',
      fileKind,
      ...(hasMenuFile(file) ? { file: compactMenuFile(file) } : {}),
      pageStyle: readMenuPageStyle(scope.page_style),
    },
  }
}

export function buildMenuPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): MenuDetailPayload {
  const sourceKind = scope.sourceKind === 'kitchen-menu'
    ? 'menu'
    : scope.sourceKind ?? readMenuSourceKind(data)

  return sourceKind === 'menu'
    ? buildMenuManifestPayload(menuId, data, scope)
    : buildMenuDocumentPayload(menuId, data, scope)
}
