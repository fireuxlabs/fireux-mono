import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from './target-definition'

export const USER_PROFILE_KINDS = [
  'agent',
  'chef',
  'customer',
  'driver',
  'marketplace',
  'professional',
] as const
export type UserProfileKind = (typeof USER_PROFILE_KINDS)[number]

const segment = assertFirestoreMutationSegment
const verbs = ALL_FIRESTORE_MUTATION_VERBS

export function serverAppUsersTarget(appId: string) {
  const id = segment(appId, 'appId')
  return defineFirestoreMutationTarget({
    key: 'apps.users',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${id}/users`,
  })
}

function serverAppChildTarget(appId: string, key: string, collection: string) {
  const id = segment(appId, 'appId')
  return defineFirestoreMutationTarget({
    key,
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${id}/${collection}`,
  })
}

export const serverAppJoinRequestsTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.join-requests', 'join_requests')
export const serverAppMembershipBlocksTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.membership-blocks', 'membership_blocks')
export const serverAppPublicSettingsTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.public-settings', 'settings')

export const serverShareProfilesTarget = defineFirestoreMutationTarget({
  key: 'share-profiles',
  lane: 'server',
  verbs,
  database: { kind: 'runtime' },
  collectionPath: 'share_profiles',
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
export const serverKitchenOrderIdempotencyTarget = (kitchenId: string) =>
  serverKitchenChildTarget(
    kitchenId,
    'kitchens.order-idempotency',
    'order-idempotency'
  )

export const serverUserOrdersTarget = (userId: string) => {
  const user = segment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key: 'users.orders',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `users/${user}/orders`,
  })
}

export const serverKitchenSalesTarget = (kitchenId: string) =>
  serverKitchenChildTarget(kitchenId, 'kitchens.sales', 'sales')

export const serverAppFinancialFactsTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.financial-facts', 'financial-facts')

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

export const serverMarketplaceStoresTarget = defineFirestoreMutationTarget({
  key: 'marketplace-stores',
  lane: 'server',
  verbs,
  database: { kind: 'runtime' },
  collectionPath: 'marketplace-stores',
})
export const serverMarketplaceStoreTeamMembersTarget = (storeId: string) => {
  const store = segment(storeId, 'storeId')
  return defineFirestoreMutationTarget({
    key: 'marketplace-stores.team',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `marketplace-stores/${store}/team`,
  })
}
export const serverPropertyTeamMembersTarget = (propertyId: string) => {
  const property = segment(propertyId, 'propertyId')
  return defineFirestoreMutationTarget({
    key: 'properties.team',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `properties/${property}/team`,
  })
}
export const serverPortfolioTeamMembersTarget = (portfolioId: string) => {
  const portfolio = segment(portfolioId, 'portfolioId')
  return defineFirestoreMutationTarget({
    key: 'portfolios.team',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `portfolios/${portfolio}/team`,
  })
}
export const serverSupplierItemsTarget = (supplierId: string) => {
  const supplier = segment(supplierId, 'supplierId')
  return defineFirestoreMutationTarget({
    key: 'suppliers.items',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `suppliers/${supplier}/items`,
  })
}
export const serverSupplierTeamMembersTarget = (supplierId: string) => {
  const supplier = segment(supplierId, 'supplierId')
  return defineFirestoreMutationTarget({
    key: 'suppliers.team',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `suppliers/${supplier}/team`,
  })
}

function fireuxAppChildTarget(appId: string, key: string, collection: string) {
  const id = segment(appId, 'appId')
  return defineFirestoreMutationTarget({
    key,
    lane: 'server',
    verbs,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: `apps/${id}/${collection}`,
  })
}

export const fireuxAppUsersTarget = (appId: string) =>
  fireuxAppChildTarget(appId, 'fireux.apps.users', 'users')
export const fireuxUserNotificationsTarget = (userId: string) => {
  const user = segment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key: 'fireux.users.notifications',
    lane: 'server',
    verbs,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: `users/${user}/notifications`,
  })
}
export function serverUserTargetsTarget(userId: string) {
  const id = segment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key: 'users.private.targets',
    lane: 'server',
    verbs,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: `users/${id}/private`,
  })
}

export function serverAppEventsTarget(appId: string) {
  const id = segment(appId, 'appId')
  return defineFirestoreMutationTarget({
    key: 'apps.events',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${id}/events`,
  })
}

export function serverAppConversationsTarget(appId: string) {
  return serverAppChildTarget(appId, 'apps.conversations', 'conversations')
}

export function serverConversationMessagesTarget(
  appId: string,
  conversationId: string
) {
  const app = segment(appId, 'appId')
  const conversation = segment(conversationId, 'conversationId')
  return defineFirestoreMutationTarget({
    key: 'apps.conversations.messages',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/conversations/${conversation}/messages`,
  })
}

export function serverConversationPrivateTarget(
  appId: string,
  conversationId: string
) {
  const app = segment(appId, 'appId')
  const conversation = segment(conversationId, 'conversationId')
  return defineFirestoreMutationTarget({
    key: 'apps.conversations.private',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/conversations/${conversation}/private`,
  })
}

export function serverUserNotificationsTarget(userId: string) {
  const id = segment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key: 'users.notifications',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `users/${id}/notifications`,
  })
}

export function serverIdentityUserNotificationsTarget(userId: string) {
  const id = segment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key: 'identity.users.notifications',
    lane: 'server',
    verbs,
    database: { kind: 'identity' },
    collectionPath: `users/${id}/notifications`,
  })
}

export function serverUserProfileTarget(
  userId: string,
  kind: UserProfileKind,
  placement: 'runtime' | 'identity'
) {
  const user = segment(userId, 'userId')
  const profileKind = segment(kind, 'profileKind')
  return defineFirestoreMutationTarget({
    key: `users.profiles.${profileKind}`,
    lane: 'server',
    verbs,
    database: { kind: placement },
    collectionPath: `users/${user}/profiles`,
  })
}

export function serverUserProfileAppStateTarget(
  userId: string,
  kind: UserProfileKind,
  appId: string,
  placement: 'runtime' | 'identity'
) {
  const user = segment(userId, 'userId')
  const profileKind = segment(kind, 'profileKind')
  segment(appId, 'appId')
  return defineFirestoreMutationTarget({
    key: `users.profiles.${profileKind}.app-state`,
    lane: 'server',
    verbs,
    database: { kind: placement },
    collectionPath: `users/${user}/profiles/${profileKind}/app-state`,
  })
}
