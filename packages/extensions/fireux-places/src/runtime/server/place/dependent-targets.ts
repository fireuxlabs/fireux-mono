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

export const dependentKitchenRootTarget = rootTarget(
  'project.kitchens',
  'kitchens'
)
export const dependentPropertyRootTarget = rootTarget(
  'project.properties',
  'properties'
)
export const dependentAppKitchenTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.kitchens', 'kitchens')
