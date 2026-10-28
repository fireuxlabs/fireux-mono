import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const KITCHEN_MUTATION_TARGETS = Object.freeze({
  kitchens: defineFirestoreMutationTarget({
    key: 'project.kitchens',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'kitchens',
  }),
})

function serverKitchenChildTarget(
  kitchenId: string,
  key: string,
  collection: string
) {
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key,
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchen}/${collection}`,
  })
}

export const serverKitchenMenuUploadsTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.menu-uploads', 'menu-uploads')

export const serverKitchenAiUsageTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.ai-usage', 'ai-usage')

export const serverKitchenMenusTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.menus', 'menus')

export const serverKitchenDishesTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.dishes', 'dishes')

export const serverKitchenTeamMembersTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.team', 'team')

export const serverKitchenTestsTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.tests', 'tests')

export const serverKitchenFulfilmentTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.fulfilment', 'fulfilment')

export const serverKitchenIntegrationsTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.integrations', 'integrations')

export const serverKitchenOrdersTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.orders', 'orders')

export const serverKitchenMenuSectionsTarget = (
  kitchenId: string,
  menuId: string
) => {
  const menus = serverKitchenMenusTarget(kitchenId)
  const menu = segment(menuId, 'menuId')
  return defineFirestoreMutationTarget({
    key: 'kitchens.menus.sections',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `${menus.collectionPath}/${menu}/sections`,
  })
}

export const serverKitchenMenuItemsTarget = (
  kitchenId: string,
  menuId: string,
  sectionId: string
) => {
  const sections = serverKitchenMenuSectionsTarget(kitchenId, menuId)
  const section = segment(sectionId, 'sectionId')
  return defineFirestoreMutationTarget({
    key: 'kitchens.menus.sections.items',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `${sections.collectionPath}/${section}/items`,
  })
}
