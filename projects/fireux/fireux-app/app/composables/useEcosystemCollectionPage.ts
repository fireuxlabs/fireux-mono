import { reactive, toRefs } from 'vue'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePublishedPlatformEcosystemDirectory } from './usePlatformDirectory'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function useEcosystemCollectionPage() {
  const { ecosystems, outcome, error } =
    usePublishedPlatformEcosystemDirectory()

  useSeo({
    title: 'FireUX Ecosystems',
    description: 'Browse published FireUX Ecosystems and their connected Apps.',
    path: '/ecosystems',
    image: '/img/app/cover.png',
    imageHeight: 720,
    imageWidth: 1280,
    jsonLdBuilder: (context) =>
      buildPublicPageJsonLd({
        canonicalUrl: context.canonicalUrl,
        description: context.description,
        image: context.image,
        pageType: 'CollectionPage',
        title: context.title,
        items: ecosystems.value.map((ecosystem) => ({
          name: ecosystem.name,
          url: context.absoluteUrl(ecosystem.detail_url),
        })),
      }),
  })

  const page = useCollectionPage({
    entity: 'ecosystems',
    title: 'Ecosystems',
    description: 'Browse published FireUX Ecosystems.',
    collection: { records: ecosystems, outcome: outcome, error },
  })
  return reactive({ ...toRefs(page), ecosystems })
}
