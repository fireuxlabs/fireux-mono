import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const segment = assertFirestoreMutationSegment
const verbs = ALL_FIRESTORE_MUTATION_VERBS

export const fireuxProjectsTarget = defineFirestoreMutationTarget({
  key: 'fireux.projects',
  lane: 'server',
  verbs,
  database: { kind: 'named', databaseId: 'fireux' },
  collectionPath: 'projects',
})

export const fireuxProjectTeamMembersTarget = (projectId: string) => {
  const project = segment(projectId, 'projectId')
  return defineFirestoreMutationTarget({
    key: 'fireux.projects.team',
    lane: 'server',
    verbs,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: `projects/${project}/team`,
  })
}

export const fireuxProjectTestsTarget = (projectId: string) => {
  const project = segment(projectId, 'projectId')
  return defineFirestoreMutationTarget({
    key: 'fireux.projects.tests',
    lane: 'server',
    verbs,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: `projects/${project}/tests`,
  })
}

