import { reactive, toRefs } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenCollection } from './useKitchenCollection'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function useKitchenCollectionPage() {
  const pageTitle = 'Kitchens'
  const { appName } = useFireUXConfig()
  const { collection: kitchens, outcome, error } = useKitchenCollection()
  useSeo({
    title: `${appName} | ${pageTitle}`,
    description:
      'Browse the Misebox Kitchen directory to discover restaurant profiles, current Menus and available ways to order.',
    path: '/kitchens',
  })

  const page = useCollectionPage({
    entity: 'kitchens',
    title: pageTitle,
    description:
      'Explore kitchens, discover their menus, and see what they are serving.',
    collection: { records: kitchens, outcome: outcome, error },
  })
  return reactive({ ...toRefs(page), kitchens })
}
