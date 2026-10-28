import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const PORTFOLIO_MUTATION_TARGETS = Object.freeze({
  portfolios: defineFirestoreMutationTarget({
    key: 'project.portfolios',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'portfolios',
  }),
})

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
