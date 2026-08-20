// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: describe root/App support transfers without overlay language.
import { AppStorage } from '../../models/app.model.ts'
export type AppScopeTransferDestinationState = 'workspace' | 'app'

export type AppScopeTransferPlanInput = {
  family: string
  rootCollection: string
  appSupportCollection: string
  rootId: string
  sourceAppId: string
  destinationAppId: string
  destinationState: AppScopeTransferDestinationState
}

export type AppScopeTransferPlan = {
  dryRun: true
  family: string
  rootPath: string
  sourceAppSupportPath: string
  destinationAppSupportPath: string
  destinationState: AppScopeTransferDestinationState
  rootPatch: Record<string, unknown>
  phases: readonly [
    'inspect_source_tree',
    'copy_app_support_tree',
    'verify_destination_tree',
    'repoint_root',
    'delete_source_tree',
  ]
}

const segment = (value: unknown, label: string) => {
  const normalized = String(value ?? '').trim()

  if (!normalized || normalized.includes('/')) {
    throw new Error(`[app-scope-transfer] ${label} must be one path segment`)
  }

  return normalized
}

/**
 * Builds the immutable dry-run contract for an app-scope transfer.
 *
 * This function performs no Firestore reads or writes. A future server-side
 * executor must copy and verify the complete App support document tree before it
 * applies `rootPatch`, and may delete the source tree only after repointing
 * succeeds.
 */
export function buildAppScopeTransferPlan(
  input: AppScopeTransferPlanInput
): AppScopeTransferPlan {
  const family = segment(input.family, 'family')
  const rootCollection = segment(input.rootCollection, 'rootCollection')
  const appSupportCollection = segment(
    input.appSupportCollection,
    'appSupportCollection'
  )
  const rootId = segment(input.rootId, 'rootId')
  const sourceAppId = segment(input.sourceAppId, 'sourceAppId')
  const destinationAppId = segment(input.destinationAppId, 'destinationAppId')

  if (sourceAppId === destinationAppId) {
    throw new Error(
      '[app-scope-transfer] source and destination apps must differ'
    )
  }

  if (
    input.destinationState !== 'workspace' &&
    input.destinationState !== 'app'
  ) {
    throw new Error(
      '[app-scope-transfer] destination must own an App support record'
    )
  }

  return Object.freeze({
    dryRun: true,
    family,
    rootPath: `${rootCollection}/${rootId}`,
    sourceAppSupportPath: `${AppStorage.collection}/${sourceAppId}/${appSupportCollection}/${rootId}`,
    destinationAppSupportPath: `${AppStorage.collection}/${destinationAppId}/${appSupportCollection}/${rootId}`,
    destinationState: input.destinationState,
    rootPatch: {
      management:
        input.destinationState === 'workspace'
          ? { mode: 'workspace' }
          : { mode: 'app', app_id: destinationAppId },
    },
    phases: [
      'inspect_source_tree',
      'copy_app_support_tree',
      'verify_destination_tree',
      'repoint_root',
      'delete_source_tree',
    ] as const,
  })
}
