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

export function serverAppChildTarget(appId: string, key: string, collection: string) {
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
export const serverAppMarketplaceStoresTarget = (appId: string) =>
  serverAppChildTarget(
    appId,
    'apps.marketplace-stores',
    'marketplace-stores'
  )


export const serverCustomerOrdersTarget = (appId: string, customerId: string) => {
  const app = segment(appId, 'appId')
  const customer = segment(customerId, 'customerId')
  return defineFirestoreMutationTarget({
    key: 'customers.orders',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/customers/${customer}/orders`,
  })
}

export const serverAppFinancialFactsTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.financial-facts', 'financial-facts')

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
export const serverRuntimeUserTargetsTarget = (userId: string) =>
  defineFirestoreMutationTarget({
    key: 'runtime.users.private.targets',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `users/${segment(userId, 'userId')}/private`,
  })

export function serverAppAuthorityTargets(
  appId: string,
  collections: readonly string[]
) {
  return [...new Set(collections)].map(
    collection => ({
      family: collection,
      target: serverAppChildTarget(
        appId,
        `apps.authority.${collection}`,
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
