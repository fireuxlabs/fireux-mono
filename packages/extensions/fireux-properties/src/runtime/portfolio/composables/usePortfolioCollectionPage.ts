import { reactive, toRefs } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePortfolioDirectory } from './usePortfolioDirectory'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function usePortfolioCollectionPage() {
  const pageTitle = 'Portfolios'
  const pageDescription =
    'Browse property portfolios and open the tools for managing one.'
  const { appName } = useFireUXConfig()
  const {
    portfolios,
    hasMore,
    loadingMore,
    loadMore,
    outcome,
    error,
    loadMoreError,
  } = usePortfolioDirectory()
  useSeo({
    title: `${appName} | ${pageTitle}`,
    description: pageDescription,
    path: '/portfolios',
  })

  const page = useCollectionPage({
    entity: 'portfolios',
    title: pageTitle,
    description: pageDescription,
    collection: { records: portfolios, outcome: outcome, error },
    pagination: {
      hasMore,
      loading: loadingMore,
      error: loadMoreError,
      loadMore,
    },
  })
  return reactive({ ...toRefs(page), portfolios })
}
