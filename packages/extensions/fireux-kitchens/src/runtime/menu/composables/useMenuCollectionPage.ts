import { ref, reactive, toRefs, computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useMenuDirectory } from './useMenuDirectory'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function useMenuCollectionPage() {
  const { appName } = useFireUXConfig()
  const search = ref('')
  const service = ref<'online' | 'collection' | 'delivery'>('online')
  const {
    pending,
    error,
    refresh,
    loadMoreError,
    collection: menus,
    hasMore,
    loadingMore,
    loadMore,
  } = useMenuDirectory({ service, search })
  useSeo({
    title: `${appName} | Menus`,
    description: 'Browse live kitchen menus.',
    path: '/menus',
  })

  const feedbackOutcome = computed(() =>
    error.value
      ? ('error' as const)
      : pending.value && !loadingMore.value
        ? ('pending' as const)
        : ('ready' as const)
  )

  const page = useCollectionPage({
    entity: 'menus',
    title: 'Menus',
    description: 'Browse live menus.',
    collection: { records: menus, outcome: feedbackOutcome, error },
    pagination: {
      hasMore: computed(
        () => hasMore.value && (!error.value || Boolean(loadMoreError.value))
      ),
      loading: loadingMore,
      error: loadMoreError,
      loadMore,
    },
  })
  return reactive({
    ...toRefs(page),
    menus,
    pending,
    error,
    refresh,
    unavailable: computed(() => Boolean(error.value && !loadMoreError.value)),
    search,
    service,
    loadMore,
  })
}
