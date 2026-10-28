import { reactive, toRefs, type MaybeRefOrGetter } from 'vue'
import { useCollectionPage } from '../../composables/shared/useCollectionPage'
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

  const page = useCollectionPage({
    entity: 'apps',
    title: options.title ?? 'Apps',
    description: options.description ?? 'Find an app and see what it offers.',
    collection: { records: apps, outcome, error },
    pagination: {
      hasMore,
      loading: loadingMore,
      error: loadMoreError,
      loadMore,
    },
    diagnostics: { derived: () => ({ scope: options.scope }) },
  })

  const { jsonLdBuilder, ...seo } = options.seo ?? {}
  useSeo({
    ...seo,
    title: seo.title ?? (() => `${appName} | ${page.title}`),
    description: seo.description ?? (() => page.description),
    path: seo.path ?? '/apps',
    ...(jsonLdBuilder
      ? {
          jsonLdBuilder: (context: FireuxSeoBuilderContext) =>
            jsonLdBuilder(context, apps.value),
        }
      : {}),
  })

  return reactive({ ...toRefs(page), apps })
}
