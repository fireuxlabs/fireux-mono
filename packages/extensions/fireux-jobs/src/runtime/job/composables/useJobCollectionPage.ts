import { reactive, toRefs } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useJobDirectory } from './useJobDirectory'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function useJobCollectionPage() {
  const { appName } = useFireUXConfig()
  const {
    jobs,
    hasMore,
    loadingMore,
    loadMore,
    outcome,
    error,
    loadMoreError,
  } = useJobDirectory()

  const pageTitle = 'Jobs'
  const pageDescription =
    'Browse published opportunities before you join, see the named employer and workplace, and apply directly without an agency in between.'

  useSeo({
    title: `${appName} | ${pageTitle}`,
    description: pageDescription,
    path: '/jobs',
  })

  const page = useCollectionPage({
    entity: 'jobs',
    title: pageTitle,
    description: pageDescription,
    collection: { records: jobs, outcome: outcome, error },
    pagination: {
      hasMore,
      loading: loadingMore,
      error: loadMoreError,
      loadMore,
    },
  })
  return reactive({ ...toRefs(page), jobs })
}
