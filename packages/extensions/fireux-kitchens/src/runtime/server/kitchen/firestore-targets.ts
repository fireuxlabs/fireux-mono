import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverAppChildTarget } from 'fireux-core/runtime/utils/firestore-mutations/server-targets'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const kitchenRootTarget = defineFirestoreMutationTarget({
  key: 'project.kitchens',
  lane: 'server',
  verbs,
  database: { kind: 'runtime' },
  collectionPath: 'kitchens',
})

export const serverAppKitchensTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.kitchens', 'kitchens')
export const serverAppDriversTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.drivers', 'drivers')

function nestedTarget(
  key: string,
  appId: string,
  kitchenId: string,
  childPath: string
) {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key,
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/${childPath}`,
  })
}

export const serverKitchenMenuUploadsTarget = (appId: string, kitchenId: string) =>
  nestedTarget('apps.kitchens.menu-uploads', appId, kitchenId, 'menu-uploads')
export const serverKitchenAiUsageTarget = (appId: string, kitchenId: string) =>
  nestedTarget('apps.kitchens.ai-usage', appId, kitchenId, 'ai-usage')
export const serverKitchenMenusTarget = (appId: string, kitchenId: string) =>
  nestedTarget('apps.kitchens.menus', appId, kitchenId, 'menus')
export const serverKitchenDishesTarget = (appId: string, kitchenId: string) =>
  nestedTarget('apps.kitchens.dishes', appId, kitchenId, 'dishes')
export const serverKitchenOrdersTarget = (appId: string, kitchenId: string) =>
  nestedTarget('apps.kitchens.orders', appId, kitchenId, 'orders')
export const serverKitchenOrderServiceTarget = (appId: string, kitchenId: string) =>
  nestedTarget('apps.kitchens.order-service', appId, kitchenId, 'order-service')
export const serverKitchenOrderIdempotencyTarget = (appId: string, kitchenId: string) =>
  nestedTarget('apps.kitchens.order-idempotency', appId, kitchenId, 'order-idempotency')
export const serverKitchenSalesTarget = (appId: string, kitchenId: string) =>
  nestedTarget('apps.kitchens.sales', appId, kitchenId, 'sales')

export function serverKitchenMenuSectionsTarget(
  appId: string,
  kitchenId: string,
  menuId: string
) {
  const menus = serverKitchenMenusTarget(appId, kitchenId)
  const menu = segment(menuId, 'menuId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.menus.sections',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `${menus.collectionPath}/${menu}/sections`,
  })
}

export function serverKitchenMenuItemsTarget(
  appId: string,
  kitchenId: string,
  menuId: string,
  sectionId: string
) {
  const sections = serverKitchenMenuSectionsTarget(appId, kitchenId, menuId)
  const section = segment(sectionId, 'sectionId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.menus.sections.items',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `${sections.collectionPath}/${section}/items`,
  })
}
