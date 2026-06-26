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
  const { collectionPath, collection: properties } =
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
    canWrite: runtimePortfolio.canWrite,
    debug,
  }
}

export type PortfolioConsolePropertiesState = ReturnType<
  typeof usePortfolioConsoleProperties
>
