// Concurrent edit — 2026-07-20 22:52 CEST — Both-Entity Authority — Property: carry access-ready relationship state into the Portfolio operation.
import { computed } from 'vue'
import {
  useActivePortfolio,
  type ActivePortfolioRuntime,
} from '../useActivePortfolio'
import { usePortfolioPropertyCollection } from './fetch/usePortfolioPropertyCollection'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioConsoleProperties(
  runtimePortfolio: ActivePortfolioRuntime = useActivePortfolio()
) {
  // Operation support spine: keep selected parent and child collection wiring out of Vue surfaces.
  const selectedPortfolio = runtimePortfolio.entity
  const {
    collectionPath,
    collection: properties,
    pending,
    error,
    outcome,
  } =
    usePortfolioPropertyCollection(runtimePortfolio)

  const portfolioName = computed(() =>
    normalizeString(selectedPortfolio.value?.name)
  )
  const debug = computed(() => ({
    portfolioId: runtimePortfolio.id.value,
    consoleAppId: runtimePortfolio.consoleAppId.value,
    rootCollection: runtimePortfolio.rootCollection.value,
    portfolioCollectionPath: runtimePortfolio.collectionPath.value,
    collectionPath: collectionPath.value,
    propertiesCount: properties.value.length,
    outcome: outcome.value,
    canRead: runtimePortfolio.canRead.value,
    canWrite: runtimePortfolio.canWrite.value,
    selectedPortfolio: selectedPortfolio.value,
  }))

  return {
    runtimePortfolio,
    selectedPortfolio,
    portfolioId: runtimePortfolio.id,
    portfolioName,
    rootCollection: runtimePortfolio.rootCollection,
    collectionPath,
    properties,
    pending,
    error,
    outcome,
    canRead: runtimePortfolio.canRead,
    canWrite: runtimePortfolio.canWrite,
    debug,
  }
}

export type PortfolioConsolePropertiesState = ReturnType<
  typeof usePortfolioConsoleProperties
>
