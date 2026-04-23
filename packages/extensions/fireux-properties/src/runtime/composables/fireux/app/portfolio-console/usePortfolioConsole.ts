import { computed, isRef } from 'vue'
import {
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  usePortfolioCollection,
  type PortfolioCollectionFilter,
} from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioFetch } from '../../firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../../../models/portfolio.model'
import type { Ref } from 'vue'

type PortfolioConsoleMode = ConsoleMode
type UsePortfolioConsoleOptions = {
  publishHeader?: boolean
  filter?: PortfolioCollectionFilter | Ref<PortfolioCollectionFilter | null | undefined> | null
}

type AppPortfolioOverlay = Partial<Portfolio> & {
  id?: string
  team_ids?: string[]
  admin_ids?: string[]
  console_enabled?: boolean
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function usePortfolioConsole(
  options: UsePortfolioConsoleOptions = {}
) {
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()
  const { avatarSrc, currentUser } = useUser()
  const { firestoreFetchCollection } = useFirestoreRead()
  const { pill } = usePortfolioInterface()
  const resolvedAppId = normalizeString(appId)
  const overlaySource = resolvedAppId
    ? firestoreFetchCollection<AppPortfolioOverlay>(
        `apps/${resolvedAppId}/portfolios`
      )
    : null
  const liveFilter = computed<PortfolioCollectionFilter>(() => {
    const currentUid = normalizeString(uid.value)
    if (!currentUid) return { ids: [] }

    const ids = (overlaySource?.value ?? [])
      .map((overlay) => {
        const id = normalizeString(overlay?.id || overlay?.slug)
        if (!id) return ''
        if (overlay?.console_enabled === false) return ''

        const members = Array.isArray(overlay?.team_ids)
          ? overlay.team_ids
          : Array.isArray(overlay?.admin_ids)
            ? overlay.admin_ids
            : []

        return members
          .map((value) => normalizeString(value))
          .includes(currentUid)
          ? id
          : ''
      })
      .filter(Boolean)

    return {
      ids,
    }
  })
  const resolvedFilter = computed<PortfolioCollectionFilter>(() => {
    if (options.filter) {
      const value = isRef(options.filter)
        ? (options.filter.value ?? undefined)
        : options.filter
      if (value) return value
    }

    return liveFilter.value
  })
  const { portfolios: livePortfolios } = usePortfolioCollection({
    filter: resolvedFilter,
  })
  const demoPortfolios = computed<Portfolio[]>(() => [])
  const { portfolio: testPortfolio } = usePortfolioFetch(uid, {
    collectionPath: 'test-portfolios',
  })

  const {
    selectedId,
    selectedMode,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<Portfolio, Portfolio, Portfolio>('portfolios', {
    liveItems: livePortfolios,
    demoItems: demoPortfolios,
    testItem: testPortfolio,
    getId: (portfolio) =>
      normalizeString((portfolio as Portfolio)?.id || (portfolio as Portfolio)?.slug),
  })

  const selectedPortfolio = computed<Portfolio | null>(
    () => selectedEntity.value as Portfolio | null
  )

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
        subtitle: normalizeString(currentUser.value?.display_name),
      }
    }

    return card
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
        subtitle:
          normalizeString(target.name) ||
          normalizeString(target.id) ||
          undefined,
        imageUrl: normalizeString(target.image_url) || undefined,
      }
    }

    return {
      title: normalizeString(target.name) || normalizeString(target.id),
      subtitle:
        normalizeString(target.region_label) ||
        normalizeString(target.slug) ||
        normalizeString(target.id) ||
        undefined,
      imageUrl: normalizeString(target.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('portfolios', header)

  const clearSelectedPortfolio = () => {
    clearSelection()
  }

  const selectPortfolio = (portfolioId: string, mode: PortfolioConsoleMode = 'live') => {
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
    clearSelectedPortfolio,
    selectPortfolio,
  }
}
