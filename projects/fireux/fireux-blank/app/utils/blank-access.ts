import {
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

/** Blank access is scoped to one App and one lifetime of its membership. */
export const blankAccessCollection = (appId: string) =>
  `blank_access/${assertFirestoreMutationSegment(appId, 'App id')}/users`

export const serverBlankAccessTarget = (appId: string) =>
  defineFirestoreMutationTarget({
    key: 'blank.access',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: blankAccessCollection(appId),
  })
