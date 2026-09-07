import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
export const blankRootTarget = defineFirestoreMutationTarget({
  key: 'blanks',
  lane: 'server',
  verbs: ['create', 'update', 'delete'],
  database: { kind: 'runtime' },
  collectionPath: 'blanks',
})
export const serverBlankTeamMembersTarget = (id: string) =>
  defineFirestoreMutationTarget({
    key: 'blanks.team',
    lane: 'server',
    verbs: ['create', 'update', 'delete'],
    database: { kind: 'runtime' },
    collectionPath: `blanks/${id}/team`,
  })
