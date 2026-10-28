import { computed, reactive, toValue, type MaybeRefOrGetter } from 'vue'
import type { ReadOutcome } from '../../utils/read-outcome'

export type CollectionPageSource = {
  records: MaybeRefOrGetter<readonly unknown[]>
  outcome: MaybeRefOrGetter<ReadOutcome>
  error?: MaybeRefOrGetter<unknown>
}

export type CollectionPagePagination = {
  hasMore: MaybeRefOrGetter<boolean>
  loading?: MaybeRefOrGetter<boolean>
  error?: MaybeRefOrGetter<unknown>
  loadMore: () => unknown
}

export type CollectionPageOptions = {
  entity: string
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string>
  collection: CollectionPageSource
  pagination?: CollectionPagePagination
  diagnostics?: {
    objects?: MaybeRefOrGetter<Record<string, unknown>>
    derived?: MaybeRefOrGetter<Record<string, unknown>>
  }
}

/** Presentation over an existing reader. Owns no acquisition, SEO or commands. */
export function useCollectionPage(options: CollectionPageOptions) {
  // Page copy.
  const title = computed(() => toValue(options.title))
  const description = computed(() => toValue(options.description) ?? '')

  // Collection facts.
  const count = computed(() => toValue(options.collection.records).length)
  const collectionOutcome = computed(() => toValue(options.collection.outcome))

  // Pagination feedback exists only when the reader supports pagination.
  const pagination = computed(() =>
    options.pagination
      ? {
          hasMore: toValue(options.pagination.hasMore),
          loading: toValue(options.pagination.loading) ?? false,
          error: toValue(options.pagination.error),
        }
      : undefined
  )
  const loadMore = options.pagination?.loadMore

  // The reader owns validity, including any retained records after paging fails.
  const state = computed(() => ({
    outcome: collectionOutcome.value,
    entity: options.entity,
    error: toValue(options.collection.error),
  }))
  const ready = computed(() => collectionOutcome.value === 'ready')

  // Diagnostics describe the same records and feedback used by the page.
  const diagnostics = computed(() => ({
    objects: toValue(options.diagnostics?.objects) ?? {
      [options.entity]: toValue(options.collection.records),
    },
    derived: {
      count: count.value,
      ...(pagination.value
        ? {
            hasMore: pagination.value.hasMore,
            loadingMore: pagination.value.loading,
          }
        : {}),
      ...toValue(options.diagnostics?.derived),
    },
  }))

  return reactive({
    title,
    description,
    ready,
    state,
    pagination,
    loadMore,
    diagnostics,
  })
}
