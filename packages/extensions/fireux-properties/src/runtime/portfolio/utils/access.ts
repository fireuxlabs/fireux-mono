import {
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

/** Portfolio access is scoped to one App and one lifetime of its membership. */
export const portfolioAccessCollection = (appId: string) =>
  `portfolio_access/${assertFirestoreMutationSegment(appId, 'App id')}/users`

export const serverPortfolioAccessTarget = (appId: string) =>
  defineFirestoreMutationTarget({
    key: 'portfolio.access',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: portfolioAccessCollection(appId),
  })
