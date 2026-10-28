import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from '../../utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const APP_MUTATION_TARGETS = Object.freeze({
  runtimeApps: defineFirestoreMutationTarget({
    key: 'runtime.apps',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'apps',
  }),
})

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
