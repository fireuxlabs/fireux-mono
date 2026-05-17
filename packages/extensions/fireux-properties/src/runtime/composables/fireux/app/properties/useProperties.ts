import { useHead, useRoute } from '#imports'
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import {
  usePropertyCollection,
  type PropertyCollectionSource,
} from '../../firestore/property/fetch/usePropertyCollection'

export function useProperties() {
  const pageTitle = 'Properties'
  const pageDescription = 'Choose a property or stay companion surface.'
  const route = useRoute()
  const { appName } = useFireUXConfig()
  const { notesVisible } = useDevUi()

  const resolveSourceMode = (path: string): PropertyCollectionSource =>
    path.endsWith('.demo')
      ? 'demo'
      : path.endsWith('.test')
        ? 'test'
        : 'live'

  const routePath = computed(() => route.fullPath || route.path)
  const sourceMode = ref<PropertyCollectionSource>(
    resolveSourceMode(routePath.value)
  )
  const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
  const { properties, pending } = usePropertyCollection({
    source: sourceMode,
  })
  const devSourceLabel = computed(() => {
    if (sourceMode.value === 'demo') return 'local demo property simulations'
    if (sourceMode.value === 'test') return 'signed-in test property simulation'
    return 'runtime database/properties'
  })
  const devPropertyCount = computed(() => properties.value.length)

  watch(routePath, (path) => {
    sourceMode.value = resolveSourceMode(path)
  })

  const setSourceMode = (value: PropertyCollectionSource) => {
    sourceMode.value = value
  }

  useHead({ title: `${appName} | ${pageTitle}` })

  return {
    pageTitle,
    pageDescription,
    sourceMode,
    properties,
    pending,
    showDevNotes,
    routePath,
    devSourceLabel,
    devPropertyCount,
    setSourceMode,
  }
}
