import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useConsoleState } from 'fireux-core/runtime/composables/fireux/console/useConsoleState'
import type { Portfolio } from '../../../models/portfolio.model'
import { getDemoPortfolioScenarios } from './demo-scenarios'
import { usePortfolioSelection } from './usePortfolioSelection'
import { useActivePortfolio } from './useActivePortfolio'
import { usePortfolioCollection } from '../../firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioInterface } from '../../firestore/portfolio/utils/view/usePortfolioInterface'

type UseRuntimePortfolioConsoleOptions = {
  publishHeader?: boolean
}

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestPortfolioSuffix = (value: unknown): string =>
  normalizeString(value)
    .replace(/\s+test portfolio$/i, '')
    .trim()

/**
 * Root portfolio console inputs.
 */
export function usePortfolioConsole(
  options: UseRuntimePortfolioConsoleOptions = {}
) {
  const runtime = useActivePortfolio()
  const portfolioSelection = usePortfolioSelection()
  const { uid, currentUser } = useAuth()
  const { pill: toPortfolioCard } = usePortfolioInterface()
  const { collection: livePortfolios } = usePortfolioCollection()
  const { collection: testPortfolios } = usePortfolioCollection({
    collectionPath: 'test-portfolios',
  })
  const scenarios = computed(getDemoPortfolioScenarios)
  const selectedMode = portfolioSelection.mode

  type PortfolioPill = NonNullable<ReturnType<typeof toPortfolioCard>> & {
    imageUrl?: string
  }

  const buildPortfolioPill = (
    target?: Portfolio | null,
    imageUrl?: unknown
  ): PortfolioPill | null => {
    const pill = toPortfolioCard(target as Portfolio | null)
    if (!pill) return null

    return {
      ...pill,
      imageUrl: normalizeString(imageUrl) || pill.avatarUrl,
      title:
        selectedMode.value === 'test'
          ? normalizeString(currentUser.value?.displayName) ||
            stripTestPortfolioSuffix(target?.name) ||
            'Your'
          : pill.title,
      subtitle:
        selectedMode.value === 'test' ? 'Test Portfolio' : pill.subtitle,
    }
  }

  const demoPortfolioPills = computed(() =>
    scenarios.value
      .map((entry) =>
        buildPortfolioPill(
          entry.portfolio as Portfolio,
          entry.manager.avatar_url
        )
      )
      .filter((entry): entry is PortfolioPill => Boolean(entry))
  )

  const livePortfolioPills = computed(() =>
    livePortfolios.value
      .map((entry) => buildPortfolioPill(entry as Portfolio))
      .filter((entry): entry is PortfolioPill => Boolean(entry))
  )

  const testPortfolioPills = computed(() => {
    const currentUid = normalizeString(uid.value)
    if (!currentUid) return []

    return testPortfolios.value
      .filter((entry) => normalizeString(entry?.id) === currentUid)
      .map((entry) => buildPortfolioPill(entry as Portfolio))
      .filter((entry): entry is PortfolioPill => Boolean(entry))
  })

  const activePortfolioPill = computed(() => {
    const sourcePills =
      selectedMode.value === 'live'
        ? livePortfolioPills.value
        : selectedMode.value === 'test'
          ? testPortfolioPills.value
          : demoPortfolioPills.value

    return (
      sourcePills.find((item) => item.id === runtime.id.value) ??
      buildPortfolioPill(
        runtime.portfolio.value as Portfolio | null,
        runtime.scenario.value?.manager.avatar_url
      )
    )
  })

  const headerData = computed(() =>
    activePortfolioPill.value
      ? {
          imageUrl: activePortfolioPill.value.imageUrl,
          title: activePortfolioPill.value.title,
          subtitle: activePortfolioPill.value.subtitle,
        }
      : null
  )

  const console = useConsoleState({
    family: 'portfolio',
    selectedId: runtime.id,
    mode: selectedMode,
    setMode: (mode) => {
      portfolioSelection.setRuntimePortfolio({ mode })
    },
    clearSelection: () => {
      portfolioSelection.setRuntimePortfolio({
        selectedId: '',
        mode: selectedMode.value,
      })
    },
    header: headerData,
    publishHeader: options.publishHeader,
  })

  return {
    runtime,
    portfolios: livePortfolios,
    scenarios,
    activePortfolioPill,
    headerData,
    console,
  }
}
