import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverAppChildTarget } from 'fireux-core/runtime/utils/firestore-mutations/server-targets'

const rootTarget = (key: string, collectionPath: string) =>
  defineFirestoreMutationTarget({
    key,
    lane: 'server',
    verbs: ['create', 'update', 'delete'],
    database: { kind: 'runtime' },
    collectionPath,
  })

export const propertyRootTarget = rootTarget('project.properties', 'properties')
export const portfolioRootTarget = rootTarget('project.portfolios', 'portfolios')
export const serverAppPropertiesTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.properties', 'properties')
export const serverAppPortfoliosTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.portfolios', 'portfolios')
