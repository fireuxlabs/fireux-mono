import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from './target-definition'

export const serverKitchenMemberInvitationsTarget = (
  appId: string,
  kitchenId: string
) => {
  const app = assertFirestoreMutationSegment(appId, 'appId')
  const kitchen = assertFirestoreMutationSegment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'apps.kitchens.member-invitations',
    lane: 'server',
    verbs: ALL_FIRESTORE_MUTATION_VERBS,
    database: { kind: 'runtime' },
    collectionPath: `apps/${app}/kitchens/${kitchen}/member-invitations`,
  })
}
