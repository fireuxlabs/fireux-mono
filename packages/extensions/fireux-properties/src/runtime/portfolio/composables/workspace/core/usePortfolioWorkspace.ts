import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { PortfolioStorage } from '../../../models/portfolio.model.ts'
import { useAppSupportAccess } from '../../../../composables/fireux/firestore/app-support-collection'
import { usePortfolioCollection } from '../../firestore/fetch/usePortfolioCollection'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../firestore/utils/view/usePortfolioInterface'

export type PortfolioWorkspaceEntity = PortfolioSurface & {
  id?: string
  tagline?: string
  image_url?: string
}

function createPortfolioWorkspace() {
  const workspace = useWorkspace('portfolio')
  const fireux = useFireUXConfig()
  const { uid } = useAuth()
  const access = useAppSupportAccess({
    db: useFirestore(),
    appId: computed(() => fireux.appId),
    collectionName: 'portfolios',
    accessId: uid,
    enabled: computed(() => Boolean(uid.value)),
  })
  const { pill } = usePortfolioInterface()
  const collection = usePortfolioCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const portfolio = computed<PortfolioWorkspaceEntity | null>(
    () =>
      collection.portfolios.value.find(
        (item) => normalizeString(item.id) === workspace.activeId.value
      ) ?? null
  )
  const portfolioCard = computed(() => {
    if (!portfolio.value) return null
    const card = pill(portfolio.value)
    return card
      ? { ...card, subtitle: normalizeString(portfolio.value.tagline) }
      : null
  })
  const canWrite = computed(() => targetHasOperator(portfolio.value, uid.value))

  return {
    portfolios: {
      targets: collection.portfolios,
      count: collection.count,
      pending: collection.pending,
      error: collection.error,
      outcome: computed(() =>
        access.outcome.value === 'ready'
          ? collection.outcome.value
          : access.outcome.value
      ),
    },
    selection: {
      portfolio,
      portfolioId: workspace.activeId,
      portfolioCard,
      portfolioState: { id: workspace.activeId, entity: portfolio },
      selectedId: workspace.activeId,
      hasSelection: computed(() => Boolean(portfolio.value)),
    },
    runtime: {
      appId: computed(() => fireux.appId),
      ecosystem: computed(() => fireux.ecosystem),
      rootCollection: computed(() => PortfolioStorage.rootCollection),
      dataType: computed(() => 'live' as const),
      isDemo: computed(() => false),
      readOnly: computed(() => !canWrite.value),
      canWrite,
    },
    actions: {
      selectPortfolio: workspace.activate,
      clearSelectedPortfolio: workspace.clearActive,
    },
  }
}

export function usePortfolioWorkspace() {
  return createPortfolioWorkspace()
}
