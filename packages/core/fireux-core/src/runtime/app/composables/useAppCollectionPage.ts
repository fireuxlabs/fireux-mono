import { computed, reactive, toValue, type MaybeRefOrGetter } from 'vue'
import { useAppCollection } from './useAppCollection'
import { useFireUXConfig } from './config/FireUXConfig'
import {
  useSeo,
  type UseSeoOptions,
  type FireuxSeoBuilderContext,
  type FireuxSeoJsonLd,
} from '../../composables/fireux/seo/useSeo'
import type { App } from '../models/app.model'

export type AppCollectionPageSeo = Partial<
  Omit<UseSeoOptions, 'jsonLdBuilder'>
> & {
  jsonLdBuilder?: (
    context: FireuxSeoBuilderContext,
    apps: readonly App[]
  ) => FireuxSeoJsonLd | null | undefined
}

/** One acquisition and SEO owner; routes retain the visible page composition. */
export function useAppCollectionPage(options: {
  scope: 'ecosystem' | 'platform'
  title?: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string>
  seo?: AppCollectionPageSeo
}) {
  const title = computed(() => toValue(options.title) ?? 'Apps')
  const description = computed(
    () => toValue(options.description) ?? 'Find an app and see what it offers.'
  )
  const { appName } = useFireUXConfig()
  const {
    apps,
    outcome,
    error,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  } = useAppCollection(
    options.scope === 'platform'
      ? '/api/platform/apps?limit=24'
      : '/api/apps?limit=24'
  )

  useSeo({
    ...options.seo,
    title: options.seo?.title ?? (() => `${appName} | ${title.value}`),
    description: options.seo?.description ?? description,
    path: options.seo?.path ?? '/apps',
    jsonLdBuilder: (context) =>
      options.seo?.jsonLdBuilder?.(context, apps.value),
  })

  return reactive({
    title,
    description,
    apps,
    ready: computed(() => outcome.value === 'ready'),
    state: computed(() => ({
      outcome: outcome.value,
      entity: 'apps',
      error: error.value,
    })),
    pagination: computed(() => ({
      hasMore: hasMore.value,
      loading: loadingMore.value,
      error: loadMoreError.value,
    })),
    diagnostics: computed(() => ({
      title: 'Apps index acquisition',
      context: 'App records and acquisition state supplied by the page reader.',
      objectOrigin: 'fetched' as const,
      objects: { apps: apps.value },
      derived: { count: apps.value.length, scope: options.scope },
      includeRoute: true,
      launcher: true,
    })),
    loadMore,
  })
}
