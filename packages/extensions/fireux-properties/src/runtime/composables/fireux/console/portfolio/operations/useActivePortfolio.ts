import { computed, type ComputedRef } from 'vue'
import {
  resolvePortfolioConsoleCollectionPath,
  resolveRuntimePortfolioPath,
} from './Shared/shared'
import {
  usePortfolioConsole,
  type PortfolioConsoleEntity,
} from '../core/usePortfolioConsole'
import { usePortfolioConsoleSelection } from '../core/usePortfolioConsoleSelection'

export type ActivePortfolioRuntime = {
  mode: ComputedRef<'live' | 'demo'>
  isDemo: ComputedRef<boolean>
  scenario: ComputedRef<Record<string, unknown> | null>
  id: ComputedRef<string>
  entity: ComputedRef<PortfolioConsoleEntity | null>
  rootCollection: ComputedRef<string>
  consoleAppId: ComputedRef<string>
  canWrite: ComputedRef<boolean>
  collectionPath: ComputedRef<string>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useActivePortfolio(): ActivePortfolioRuntime {
  const selection = usePortfolioConsoleSelection()
  const {
    selection: consoleSelection,
    runtime,
  } = usePortfolioConsole()

  const id = computed(
    () =>
      normalizeString(consoleSelection.portfolio.value?.id) || selection.selectedId.value
  )
  const collectionPath = computed(() => {
    if (!id.value) return ''

    return resolvePortfolioConsoleCollectionPath(runtime.appId.value)
  })
  const mode = computed<'live' | 'demo'>(() => 'live')
  const isDemo = computed(() => mode.value === 'demo')
  const scenario = computed<Record<string, unknown> | null>(() => null)

  return {
    mode,
    isDemo,
    scenario,
    id,
    entity: consoleSelection.portfolio,
    rootCollection: runtime.rootCollection,
    consoleAppId: runtime.appId,
    canWrite: runtime.canWrite,
    collectionPath,
  }
}

export function usePortfolioConsoleChildPath(
  runtimePortfolio: Pick<ActivePortfolioRuntime, 'collectionPath' | 'id'>,
  childCollection: string
) {
  return computed(() =>
    resolveRuntimePortfolioPath(
      runtimePortfolio.collectionPath.value,
      runtimePortfolio.id.value,
      childCollection
    )
  )
}
