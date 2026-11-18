import type { createPrepSummaries } from './summaries'
import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'

type PrepWorkspace = {
  description: ComputedRef<string>
  ready: ComputedRef<boolean>
  createTo: string
  summaries: ReturnType<typeof createPrepSummaries>['summaries']
  overview: {
    query: Ref<string>
    summary: ComputedRef<
      ReturnType<
        typeof createPrepSummaries
      >['summaries']['value']['preparations']
    >
    results: ComputedRef<
      ReturnType<typeof createPrepSummaries>['preparations']['value']
    >
  }
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
