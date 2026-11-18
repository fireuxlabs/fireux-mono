import type { createPrepSummaries } from './summaries'
import { inject, type ComputedRef, type InjectionKey } from 'vue'

type PrepWorkspace = {
  description: ComputedRef<string>
  ready: ComputedRef<boolean>
  createTo: string
  summaries: ReturnType<typeof createPrepSummaries>['summaries']
  preparations: ReturnType<typeof createPrepSummaries>['preparations']
}
export const prepWorkspaceKey: InjectionKey<PrepWorkspace> = Symbol(
  'KitchenWorkspacePrep'
)

export function requirePrepWorkspace() {
  const workspace = inject(prepWorkspaceKey, null)
  if (!workspace)
    throw new Error('Prep children require their workspace owner.')
  return workspace
}
