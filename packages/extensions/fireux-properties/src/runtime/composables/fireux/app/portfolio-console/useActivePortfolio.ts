import { computed, type ComputedRef } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  getDemoPortfolioScenario,
  type DemoPortfolioScenario,
} from './demo-scenarios'
import {
  ROOT_PORTFOLIO_COLLECTION_PATH,
  TEST_PORTFOLIO_COLLECTION_PATH,
  resolvePortfolioConsoleCollectionPath,
  resolveRuntimePortfolioPath,
} from './shared'
import {
  usePortfolioConsole,
  type PortfolioConsoleEntity,
} from './usePortfolioConsole'
import { usePortfolioSelection } from './usePortfolioSelection'

export type ActivePortfolioRuntime = {
  id: ComputedRef<string>
  mode: ComputedRef<ConsoleMode>
  entity: ComputedRef<PortfolioConsoleEntity | null>
  isDemo: ComputedRef<boolean>
  isTest: ComputedRef<boolean>
  scenario: ComputedRef<DemoPortfolioScenario | null>
  collectionPath: ComputedRef<string>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useActivePortfolio(): ActivePortfolioRuntime {
  const { appId } = useFireUXConfig()
  const selection = usePortfolioSelection()
  const { selectedPortfolio, selectedMode } = usePortfolioConsole()

  const resolvedAppId = computed(() => normalizeString(appId))
  const mode = computed<ConsoleMode>(() => selectedMode.value)
  const id = computed(
    () =>
      normalizeString(selectedPortfolio.value?.id) || selection.selectedId.value
  )
  const isDemo = computed(() => mode.value === 'demo')
  const isTest = computed(() => mode.value === 'test')
  const scenario = computed(() =>
    isDemo.value ? getDemoPortfolioScenario(id.value) : null
  )
  const collectionPath = computed(() => {
    if (!id.value || isDemo.value) return ''
    if (isTest.value) return TEST_PORTFOLIO_COLLECTION_PATH

    return (
      resolvePortfolioConsoleCollectionPath(resolvedAppId.value) ||
      ROOT_PORTFOLIO_COLLECTION_PATH
    )
  })

  return {
    id,
    mode,
    entity: selectedPortfolio,
    isDemo,
    isTest,
    scenario,
    collectionPath,
  }
}

export function useRuntimePortfolioPath(
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
