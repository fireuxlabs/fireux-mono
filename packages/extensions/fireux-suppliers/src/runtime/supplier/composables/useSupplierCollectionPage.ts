import { reactive, toRefs } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useSupplierCollection } from './useSupplierCollection'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function useSupplierCollectionPage() {
  const pageTitle = 'Suppliers'
  const pageDescription =
    'Browse supplier identities, catalogues and delivery areas.'
  const { appName } = useFireUXConfig()
  const { suppliers, outcome, error } = useSupplierCollection()
  useSeo({
    title: `${appName} | ${pageTitle}`,
    description: pageDescription,
    path: '/suppliers',
  })

  const page = useCollectionPage({
    entity: 'suppliers',
    title: pageTitle,
    description: pageDescription,
    collection: { records: suppliers, outcome: outcome, error },
  })
  return reactive({ ...toRefs(page), suppliers })
}
