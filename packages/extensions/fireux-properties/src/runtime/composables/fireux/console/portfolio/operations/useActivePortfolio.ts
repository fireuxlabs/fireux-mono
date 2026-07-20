// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: centralize Portfolio operation write authorization.
// Concurrent edit — 2026-07-20 23:00 CEST — Both-Entity Authority: expose access-resolved target readiness for related Property reads.
import { computed, type ComputedRef, type Ref } from 'vue'
import type { ConsoleSource } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
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
  source: ComputedRef<ConsoleSource>
  mode: ComputedRef<ConsoleSource>
  isDemo: ComputedRef<boolean>
  scenario: ComputedRef<Record<string, unknown> | null>
  id: ComputedRef<string>
  entity: ComputedRef<PortfolioConsoleEntity | null>
  rootCollection: ComputedRef<string>
  consoleAppId: ComputedRef<string>
  targetOutcome: Readonly<Ref<ConsoleTargetOutcome>>
  canRead: ComputedRef<boolean>
  canWrite: ComputedRef<boolean>
  collectionPath: ComputedRef<string>
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function requirePortfolioConsoleWrite(
  runtimePortfolio: Pick<ActivePortfolioRuntime, 'id' | 'canWrite'>,
  namespace: string
) {
  const portfolioId = normalizeString(runtimePortfolio.id.value)
  const label = normalizeString(namespace) || 'fireux-portfolio'

  if (!portfolioId) {
    throw new Error(`[${label}] portfolio id is required.`)
  }
  if (!runtimePortfolio.canWrite.value) {
    throw new Error(`[${label}] current operator does not have write access.`)
  }

  return portfolioId
}

export function useActivePortfolio(): ActivePortfolioRuntime {
  const selection = usePortfolioConsoleSelection()
  const {
    portfolios,
    selection: consoleSelection,
    runtime,
  } = usePortfolioConsole()

  const id = computed(
    () =>
      normalizeString(consoleSelection.portfolio.value?.id) || selection.selectedId.value
  )
  const collectionPath = computed(() => {
    if (!id.value) return ''

    return resolvePortfolioConsoleCollectionPath(
      runtime.appId.value,
      runtime.source.value
    )
  })
  const source = runtime.source
  const mode = source
  const isDemo = computed(() => source.value === 'demo')
  const scenario = computed<Record<string, unknown> | null>(() => null)
  const targetOutcome = portfolios.outcome
  const canRead = computed(() =>
    targetOutcome.value === 'ready' &&
    Boolean(normalizeString(consoleSelection.portfolio.value?.id))
  )

  return {
    source,
    mode,
    isDemo,
    scenario,
    id,
    entity: consoleSelection.portfolio,
    rootCollection: runtime.rootCollection,
    consoleAppId: runtime.appId,
    targetOutcome,
    canRead,
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
