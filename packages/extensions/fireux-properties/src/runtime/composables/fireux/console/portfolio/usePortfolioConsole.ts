import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  resolveConsoleRootCollection,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  usePortfolioCollection,
  type PortfolioCollectionFilter,
} from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../firestore/portfolio/utils/view/usePortfolioInterface'
import { getDemoPortfolios } from './operations/demo-scenarios'
import type { Ref } from 'vue'

type PortfolioConsoleMode = ConsoleMode
export type PortfolioConsoleEntity = PortfolioSurface & {
  id?: string
  tagline?: string
  image_url?: string
}
type UsePortfolioConsoleOptions = {
  filter?:
    | PortfolioCollectionFilter
    | Ref<PortfolioCollectionFilter | null | undefined>
    | null
}

export function usePortfolioConsole(options: UsePortfolioConsoleOptions = {}) {
  const { uid } = useAuth()
  const normalizedUid = computed(() => normalizeString(uid.value))
  const { avatarSrc } = useUser()
  const { pill } = usePortfolioInterface()
  const liveFilter = computed<PortfolioCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? (options.filter.value ?? {})
      : (options.filter ?? {})

    return {
      ...explicitFilter,
      operatorId: normalizedUid.value,
    }
  })
  const { portfolios: livePortfolios } = usePortfolioCollection({
    filter: liveFilter,
  })
  const demoPortfolios = computed<PortfolioConsoleEntity[]>(() =>
    getDemoPortfolios()
  )
  const { portfolio: testPortfolio } = usePortfolioFetch(normalizedUid, {
    collectionPath: 'test-portfolios',
  })

  const {
    selectedId,
    selectedMode,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<
    PortfolioConsoleEntity,
    PortfolioConsoleEntity,
    PortfolioConsoleEntity
  >('portfolios', {
    liveItems: livePortfolios,
    demoItems: demoPortfolios,
    testItem: testPortfolio,
    getId: (portfolio) =>
      normalizeString((portfolio as PortfolioConsoleEntity)?.id),
  })

  const selectedPortfolio = computed<PortfolioConsoleEntity | null>(
    () => selectedEntity.value as PortfolioConsoleEntity | null
  )
  const portfolioId = computed(() => normalizeString(selectedPortfolio.value?.id))
  const rootCollection = computed(() =>
    resolveConsoleRootCollection('portfolios', selectedMode.value)
  )
  const canWrite = computed(() => {
    if (selectedMode.value === 'demo') return false
    if (selectedMode.value === 'test') return Boolean(normalizedUid.value && portfolioId.value === normalizedUid.value)
    return targetHasOperator(selectedPortfolio.value, normalizedUid.value)
  })

  const portfolio = computed(() => {
    const target = selectedPortfolio.value
    if (!target) return null

    const card = pill(target)
    if (!card) return null

    if (selectedMode.value === 'test') {
      return {
        ...card,
        imageUrl: avatarSrc.value || card.imageUrl,
        avatarUrl: avatarSrc.value || card.avatarUrl,
        title: 'Test Portfolio',
        subtitle: normalizeString(target.tagline),
      }
    }

    return {
      ...card,
      subtitle: normalizeString(target.tagline),
    }
  })

  const portfolioState = {
    id: selectedId,
    mode: selectedMode,
    entity: selectedPortfolio,
  }

  const header = computed<ConsoleHeaderData>(() => {
    const target = selectedPortfolio.value as Record<string, unknown> | null
    if (!target) return null

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Portfolio',
        subtitle: normalizeString(target.tagline) || undefined,
        imageUrl: normalizeString(target.image_url) || undefined,
      }
    }

    return {
      title: normalizeString(target.name) || normalizeString(target.id),
      subtitle: normalizeString(target.tagline) || undefined,
      imageUrl: normalizeString(target.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('portfolios', header)

  const clearSelectedPortfolio = () => {
    clearSelection()
  }

  const selectPortfolio = (
    portfolioId: string,
    mode: PortfolioConsoleMode = 'live'
  ) => {
    selectEntity(portfolioId, mode)
  }

  return {
    livePortfolios,
    demoPortfolios,
    testPortfolio,
    portfolioState,
    portfolio,
    selectedPortfolio,
    selectedMode,
    portfolioId,
    rootCollection,
    canWrite,
    clearSelectedPortfolio,
    selectPortfolio,
  }
}
