import { reactive, toRefs } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePlaceCollection } from './usePlaceCollection'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function usePlaceCollectionPage() {
  // Concurrent edit — 2026-07-22 16:08 CEST — Misebox operations shortcuts: expose the canonical Places index to entity discovery.

  const { appName } = useFireUXConfig()
  const {
    collection: places,
    hasMore,
    loadingMore,
    loadMore,
    outcome,
    error,
    loadMoreError,
  } = usePlaceCollection()
  const pageTitle = 'Places'
  const pageDescription =
    'Explore venues, locations, and the physical places behind local services.'
  useSeo({
    title: `${appName} | ${pageTitle}`,
    description: pageDescription,
    path: '/places',
  })

  const page = useCollectionPage({
    entity: 'places',
    title: pageTitle,
    description: pageDescription,
    collection: { records: places, outcome: outcome, error },
    pagination: {
      hasMore,
      loading: loadingMore,
      error: loadMoreError,
      loadMore,
    },
  })
  return reactive({ ...toRefs(page), places, loadMore })
}
