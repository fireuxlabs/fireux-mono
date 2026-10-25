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
    title?: string
    context?: string
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

  // Retained records remain presentable after a next-page failure.
  const presentationOutcome = computed<ReadOutcome>(() =>
    count.value > 0 && pagination.value?.error
      ? 'ready'
      : collectionOutcome.value
  )
  const state = computed(() => ({
    outcome: presentationOutcome.value,
    entity: options.entity,
    error: toValue(options.collection.error),
  }))
  const ready = computed(() => presentationOutcome.value === 'ready')

  // Diagnostics describe the same records and feedback used by the page.
  const diagnostics = computed(() => ({
    title: options.diagnostics?.title ?? `${title.value} index acquisition`,
    context:
      options.diagnostics?.context ??
      'Records and acquisition state supplied by the page reader.',
    objectOrigin: 'fetched' as const,
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
    includeRoute: true,
    launcher: true,
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
