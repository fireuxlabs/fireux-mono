import { useAppCollectionPage } from 'fireux-core/runtime/app/composables/useAppCollectionPage'
import { buildPublicPageJsonLd } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { isDirectoryAppIndexable } from '../utils/directorySearchPolicy'

/** FireUX-owned platform directory presentation and search policy. */
export function usePlatformAppsPage() {
  return useAppCollectionPage({
    scope: 'platform',
    title: 'Showcase',
    description:
      'Explore the public App directory and see what each product offers.',
    seo: {
      title: 'FireUX Apps',
      description:
        'Browse Apps across the FireUX platform, including direct Project Apps and Ecosystem Apps.',
      path: '/apps',
      image: '/img/app/cover.png',
      jsonLdBuilder: (context, apps) =>
        buildPublicPageJsonLd({
          canonicalUrl: context.canonicalUrl,
          description: context.description,
          image: context.image,
          pageType: 'CollectionPage',
          title: context.title,
          items: apps
            .filter((app) => isDirectoryAppIndexable(app.id))
            .map((app) => ({
              name: app.name,
              url: context.absoluteUrl(`/apps/${encodeURIComponent(app.id)}`),
            })),
        }),
    },
  })
}
