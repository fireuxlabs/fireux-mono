import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const PROPERTY_MUTATION_TARGETS = Object.freeze({
  properties: defineFirestoreMutationTarget({
    key: 'project.properties',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'properties',
  }),
})

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
