import { computed, type ComputedRef } from 'vue'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import {
  getDemoPortfolioScenario,
  type DemoPortfolioScenario,
} from './demo-scenarios'
import {
  TEST_PORTFOLIO_COLLECTION_PATH,
  resolvePortfolioConsoleCollectionPath,
  resolveRuntimePortfolioPath,
} from './Shared/shared'
import {
  usePortfolioConsole,
  type PortfolioConsoleEntity,
} from '../core/usePortfolioConsole'
import { usePortfolioConsoleTargets } from '../core/usePortfolioConsoleTargets'

export type ActivePortfolioRuntime = {
  id: ComputedRef<string>
  mode: ComputedRef<ConsoleMode>
  entity: ComputedRef<PortfolioConsoleEntity | null>
  isDemo: ComputedRef<boolean>
  isTest: ComputedRef<boolean>
  rootCollection: ComputedRef<string>
  consoleAppId: ComputedRef<string>
  canWrite: ComputedRef<boolean>
  scenario: ComputedRef<DemoPortfolioScenario | null>
  collectionPath: ComputedRef<string>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useActivePortfolio(): ActivePortfolioRuntime {
  const selection = usePortfolioConsoleTargets()
  const {
    selectedPortfolio,
    selectedMode,
    activePortfolioAppId,
    rootCollection,
    canWrite,
  } = usePortfolioConsole()

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

    return resolvePortfolioConsoleCollectionPath(activePortfolioAppId.value)
  })

  return {
    id,
    mode,
    entity: selectedPortfolio,
    isDemo,
    isTest,
    rootCollection,
    consoleAppId: activePortfolioAppId,
    canWrite,
    scenario,
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
