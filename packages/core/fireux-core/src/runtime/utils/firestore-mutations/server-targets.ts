import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from './target-definition'

const ROOT_PROFILE_COLLECTIONS = Object.freeze({
  agent: 'agents',
  chef: 'chefs',
  driver: 'drivers',
  professional: 'professionals',
})
const APP_PROFILE_COLLECTIONS = Object.freeze({
  ...ROOT_PROFILE_COLLECTIONS,
  customer: 'customers',
})
const APP_AUTHORITY_COLLECTIONS = Object.freeze({
  blank: 'blanks',
  kitchen: 'kitchens',
  portfolio: 'portfolios',
  property: 'properties',
  supplier: 'suppliers',
})

const segment = assertFirestoreMutationSegment
const verbs = ALL_FIRESTORE_MUTATION_VERBS

export function serverUserAccountTarget(userId: string) {
  const id = segment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key: 'users.private.account',
    lane: 'server',
    verbs,
    database: { kind: 'identity' },
    collectionPath: `users/${id}/private`,
  })
}

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
export const serverAppDriversTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.drivers', 'drivers')
export const serverAppKitchensTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.kitchens', 'kitchens')
export const serverAppMarketplaceStoresTarget = (appId: string) =>
  serverAppChildTarget(
    appId,
    'apps.marketplace-stores',
    'marketplace-stores'
  )

export const serverKitchenMenuUploadsTarget = (
  appId: string,
  kitchenId: string
) => {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.menu-uploads',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/menu-uploads`,
  })
}

export const serverKitchenAiUsageTarget = (
  appId: string,
  kitchenId: string
) => {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.ai-usage',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/ai-usage`,
  })
}

export const serverKitchenMenusTarget = (appId: string, kitchenId: string) => {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.menus',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/menus`,
  })
}

export const serverKitchenDishesTarget = (appId: string, kitchenId: string) => {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.dishes',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/dishes`,
  })
}

export const serverKitchenOrdersTarget = (appId: string, kitchenId: string) => {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.orders',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/orders`,
  })
}

export const serverKitchenOrderServiceTarget = (
  appId: string,
  kitchenId: string
) => {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.order-service',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/order-service`,
  })
}

export const serverKitchenOrderIdempotencyTarget = (
  appId: string,
  kitchenId: string
) => {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.order-idempotency',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/order-idempotency`,
  })
}

export const serverCustomerOrdersTarget = (customerId: string) => {
  const customer = segment(customerId, 'customerId')
  return defineFirestoreMutationTarget({
    key: 'customers.orders',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `customers/${customer}/orders`,
  })
}

export const serverKitchenSalesTarget = (appId: string, kitchenId: string) => {
  const app = segment(appId, 'appId')
  const kitchen = segment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.sales',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/sales`,
  })
}

export const serverAppFinancialFactsTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.financial-facts', 'financial-facts')

export const serverKitchenMenuSectionsTarget = (
  appId: string,
  kitchenId: string,
  menuId: string
) => {
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

export const serverKitchenMenuItemsTarget = (
  appId: string,
  kitchenId: string,
  menuId: string,
  sectionId: string
) => {
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

export const serverAppPropertiesTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.properties', 'properties')
export const serverAppPortfoliosTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.portfolios', 'portfolios')
export const serverAppSuppliersTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.suppliers', 'suppliers')
export const serverAppProjectsTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.projects', 'projects')

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
export const fireuxAppProjectsTarget = (appId: string) =>
  fireuxAppChildTarget(appId, 'fireux.apps.projects', 'projects')

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

export function serverAppAuthorityTargets(appId: string) {
  return Object.entries(APP_AUTHORITY_COLLECTIONS).map(
    ([family, collection]) => ({
      family,
      target: serverAppChildTarget(
        appId,
        `apps.authority.${family}`,
        collection
      ),
    })
  )
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

export function serverRootProfileTarget(
  profileId: keyof typeof ROOT_PROFILE_COLLECTIONS,
  placement: 'runtime' | 'identity'
) {
  return defineFirestoreMutationTarget({
    key: `profiles.root.${profileId}`,
    lane: 'server',
    verbs,
    database: { kind: placement },
    collectionPath: ROOT_PROFILE_COLLECTIONS[profileId],
  })
}

export function serverAppProfileTarget(
  appId: string,
  profileId: keyof typeof APP_PROFILE_COLLECTIONS
) {
  const id = segment(appId, 'appId')
  return defineFirestoreMutationTarget({
    key: `profiles.app.${profileId}`,
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${id}/${APP_PROFILE_COLLECTIONS[profileId]}`,
  })
}

export function profileCollectionForTarget(
  scope: 'root' | 'app',
  profileId: string
) {
  const collections =
    scope === 'root' ? ROOT_PROFILE_COLLECTIONS : APP_PROFILE_COLLECTIONS
  return collections[profileId as keyof typeof collections] ?? ''
}
