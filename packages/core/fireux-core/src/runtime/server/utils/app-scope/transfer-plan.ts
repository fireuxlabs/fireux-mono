import type { FireuxAppScopeState } from '../../../models/core/meta.model'

export type AppScopeRepresentation = 'flat' | 'nested'
export type AppScopeTransferDestinationState = Exclude<
  FireuxAppScopeState,
  'root_only'
>

export type AppScopeTransferPlanInput = {
  family: string
  rootCollection: string
  overlayCollection: string
  rootId: string
  sourceAppId: string
  destinationAppId: string
  destinationState: AppScopeTransferDestinationState
  representation: AppScopeRepresentation
}

export type AppScopeTransferPlan = {
  dryRun: true
  family: string
  rootPath: string
  sourceOverlayPath: string
  destinationOverlayPath: string
  destinationState: AppScopeTransferDestinationState
  rootPatch: Record<string, unknown>
  phases: readonly [
    'inspect_source_tree',
    'copy_overlay_tree',
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
 * executor must copy and verify the complete overlay document tree before it
 * applies `rootPatch`, and may delete the source tree only after repointing
 * succeeds.
 */
export function buildAppScopeTransferPlan(
  input: AppScopeTransferPlanInput
): AppScopeTransferPlan {
  const family = segment(input.family, 'family')
  const rootCollection = segment(input.rootCollection, 'rootCollection')
  const overlayCollection = segment(input.overlayCollection, 'overlayCollection')
  const rootId = segment(input.rootId, 'rootId')
  const sourceAppId = segment(input.sourceAppId, 'sourceAppId')
  const destinationAppId = segment(input.destinationAppId, 'destinationAppId')

  if (sourceAppId === destinationAppId) {
    throw new Error('[app-scope-transfer] source and destination apps must differ')
  }

  if (
    input.destinationState !== 'parent_app' &&
    input.destinationState !== 'tenant_app'
  ) {
    throw new Error('[app-scope-transfer] destination must own an app overlay')
  }

  if (input.representation !== 'flat' && input.representation !== 'nested') {
    throw new Error('[app-scope-transfer] representation must be flat or nested')
  }

  const ownership = {
    state: input.destinationState,
    app_id: destinationAppId,
  }

  return Object.freeze({
    dryRun: true,
    family,
    rootPath: `${rootCollection}/${rootId}`,
    sourceOverlayPath: `apps/${sourceAppId}/${overlayCollection}/${rootId}`,
    destinationOverlayPath: `apps/${destinationAppId}/${overlayCollection}/${rootId}`,
    destinationState: input.destinationState,
    rootPatch: input.representation === 'nested'
      ? { app_scope: ownership }
      : {
          app_scope_state: ownership.state,
          app_scope_app_id: ownership.app_id,
        },
    phases: [
      'inspect_source_tree',
      'copy_overlay_tree',
      'verify_destination_tree',
      'repoint_root',
      'delete_source_tree',
    ] as const,
  })
}
