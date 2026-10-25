import { reactive, toRefs } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePropertyDirectory } from './usePropertyDirectory'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function usePropertyCollectionPage() {
  const pageTitle = 'Properties'
  const pageDescription = 'Browse properties available through this app.'
  const { appName } = useFireUXConfig()
  const {
    properties,
    hasMore,
    loadingMore,
    loadMore,
    outcome,
    error,
    loadMoreError,
  } = usePropertyDirectory()
  useSeo({
    title: `${appName} | ${pageTitle}`,
    description: pageDescription,
    path: '/properties',
  })

  const page = useCollectionPage({
    entity: 'properties',
    title: pageTitle,
    description: pageDescription,
    collection: { records: properties, outcome: outcome, error },
    pagination: {
      hasMore,
      loading: loadingMore,
      error: loadMoreError,
      loadMore,
    },
  })
  return reactive({ ...toRefs(page), properties, loadMore })
}
