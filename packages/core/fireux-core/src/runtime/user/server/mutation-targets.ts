import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from '../../utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const USER_MUTATION_TARGETS = Object.freeze({
  users: defineFirestoreMutationTarget({
    key: 'users',
    lane: 'server',
    verbs,
    database: { kind: 'identity' },
    collectionPath: 'users',
  }),
  runtimeUsers: defineFirestoreMutationTarget({
    key: 'runtime.users',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'users',
  }),
})

export const USER_PROFILE_KINDS = [
  'agent',
  'chef',
  'customer',
  'driver',
  'marketplace',
  'professional',
] as const

export type UserProfileKind = (typeof USER_PROFILE_KINDS)[number]

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

function serverUserPrivateTarget(userId: string, key: string) {
  const id = assertFirestoreMutationSegment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key,
    lane: 'server',
    verbs: ALL_FIRESTORE_MUTATION_VERBS,
    database: { kind: 'identity' },
    collectionPath: `users/${id}/private`,
  })
}

export const serverUserAccountTarget = (userId: string) =>
  serverUserPrivateTarget(userId, 'users.private.account')

export const serverUserContextTarget = (userId: string) =>
  serverUserPrivateTarget(userId, 'users.private.context')
