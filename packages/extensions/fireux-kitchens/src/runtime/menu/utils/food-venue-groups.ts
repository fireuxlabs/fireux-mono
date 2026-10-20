import type { MenuDirectoryEntry } from '../models/menu-directory.response'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  menuRoutePath,
} from './menu-route'

export const foodPortalServices = [
  { label: 'Collection', value: 'collection', icon: 'i-lucide-shopping-bag' },
  { label: 'Delivery', value: 'delivery', icon: 'i-lucide-truck' },
] as const
export type FoodPortalService =
  | ''
  | (typeof foodPortalServices)[number]['value']

function supportsService(menu: MenuDirectoryEntry, service: FoodPortalService) {
  return menu.offering_options?.some(
    (option) =>
      (service
        ? option.type === service
        : ['collection', 'delivery'].includes(option.type)) &&
      !option.paused &&
      !menu.offerings?.some(
        (offering) =>
          offering.id === option.kitchen_offering_id && offering.separate
      )
  )
}

function servingTimes(menu: MenuDirectoryEntry, service: FoodPortalService) {
  return (menu.offerings || []).filter(
    (offering) =>
      !offering.paused &&
      !offering.separate &&
      menu.offering_options?.some(
        (option) =>
          option.kitchen_offering_id === offering.id &&
          !option.paused &&
          option.type === service
      )
  )
}

const uniqueById = <T extends { id: string }>(values: T[]) => [
  ...new Map(values.map((value) => [value.id, value])).values(),
]

/** Build customer venue cards from already-acquired Menu projections. */
export function foodVenueGroups(
  menus: MenuDirectoryEntry[],
  service: FoodPortalService = ''
) {
  const grouped = new Map<string, MenuDirectoryEntry[]>()
  for (const menu of menus) {
    if (!menu.source?.kitchen_slug || !supportsService(menu, service)) continue
    const key = menu.source.kitchen_id || menu.source.kitchen_slug || menu.id
    const entries = grouped.get(key) || []
    entries.push(menu)
    grouped.set(key, entries)
  }
  return [...grouped].map(([id, entries]) => {
    const first = entries[0]!
    const scope = directoryMenuRouteScope(first.source!.kitchen_slug!)
    return {
      id,
      name: first.source?.kitchen_name || first.kitchen?.name || '',
      logo: first.kitchen?.logo_image_url,
      title: first.kitchen?.services_title || 'Food & drinks',
      descriptions: [
        ...new Set(entries.map((menu) => menu.description).filter(Boolean)),
      ],
      matchingDishes: uniqueById(
        entries.flatMap((menu) => menu.matching_dishes || [])
      ),
      actions: foodPortalServices
        .filter(
          (choice) =>
            (!service || service === choice.value) &&
            entries.some((menu) => supportsService(menu, choice.value))
        )
        .map((choice) => ({
          label: choice.label,
          icon: choice.icon,
          to: menuRouteIndexPath(scope, choice.value),
          offerings: uniqueById(
            entries.flatMap((menu) => servingTimes(menu, choice.value))
          ),
        })),
      otherOfferings: uniqueById(
        entries.flatMap((menu) => menu.other_offerings || [])
      ).map((offering) => ({
        ...offering,
        to: menuRoutePath({
          scope,
          menuId: offering.menu_slug,
          context: 'generic',
        }),
      })),
    }
  })
}

export type FoodVenueGroup = ReturnType<typeof foodVenueGroups>[number]
