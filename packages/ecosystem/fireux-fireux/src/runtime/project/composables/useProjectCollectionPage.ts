import { reactive, toRefs } from 'vue'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjects } from './useProjects'
import { useCollectionPage } from 'fireux-core/runtime/composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function useProjectCollectionPage() {
  const { projects, outcome, error } = useProjects()

  useSeo({
    title: 'FireUX Projects',
    description: 'Browse FireUX Projects and the Apps connected to each one.',
    path: '/projects',
    image: '/img/app/cover.png',
  })

  const page = useCollectionPage({
    entity: 'projects',
    title: 'Projects',
    description: 'Browse active FireUX Projects.',
    collection: { records: projects, outcome: outcome, error },
  })
  return reactive({ ...toRefs(page), projects })
}
