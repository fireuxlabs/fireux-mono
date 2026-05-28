import { useHead, useRoute } from '#imports'
import { collection, getDocs, query as fsq, where } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useDevUi } from 'fireux-core/runtime/composables/fireux/app/ui/useDevUi'
import {
  readRuntimeSimulationFirestoreDatabaseId,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { KitchenStorage } from '../../../../models/kitchen.model'
import type { KitchenCollectionSource } from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenPublicAccess } from './useKitchenPublicAccess'

export function useKitchens() {
  const pageTitle = 'Kitchens'
  const pageDescription = 'Choose a kitchen surface for this runtime.'
  const route = useRoute()
  const { appName } = useFireUXConfig()
  const { notesVisible } = useDevUi()
  const simulationDatabaseId = computed(
    () => readRuntimeSimulationFirestoreDatabaseId() || ''
  )
  const resolveSimulationDb = useFirestoreResolver(simulationDatabaseId)

  const resolveSourceMode = (path: string): KitchenCollectionSource =>
    path.endsWith('.demo')
      ? 'demo'
      : path.endsWith('.test')
        ? 'test'
        : 'live'

  const routePath = computed(() => route.fullPath || route.path)
  const sourceMode = ref<KitchenCollectionSource>(
    resolveSourceMode(routePath.value)
  )
  const showDevNotes = computed(() => import.meta.dev && notesVisible.value)
  const { kitchens, pending } = useKitchenPublicAccess({
    source: sourceMode,
  })
  const devSourceLabel = computed(() => {
    if (sourceMode.value === 'demo') return 'local demo scenario'
    if (sourceMode.value === 'test') {
      return `${simulationDatabaseId.value || 'missing simulation database'}/kitchens?simulation_kind=test`
    }
    return 'runtime database/kitchens'
  })
  const devKitchenCount = computed(() => kitchens.value.length)
  const devTestProbe = ref('not run')

  watch(routePath, (path) => {
    sourceMode.value = resolveSourceMode(path)
  })

  const setSourceMode = (value: KitchenCollectionSource) => {
    sourceMode.value = value
  }

  watch(
    sourceMode,
    async (value) => {
      if (!import.meta.client || value !== 'test') return
      if (!simulationDatabaseId.value) {
        devTestProbe.value = 'missing simulation database id'
        return
      }

      try {
        const q = fsq(
          collection(resolveSimulationDb(), KitchenStorage.rootCollection),
          where('simulation_kind', '==', 'test')
        )
        const snap = await getDocs(q)
        devTestProbe.value = `client getDocs count: ${snap.size}`
      } catch (error) {
        const code = String((error as any)?.code || 'unknown')
        const message = String((error as any)?.message || error)
        devTestProbe.value = `${code}: ${message}`
      }
    },
    { immediate: true }
  )

  useHead({ title: `${appName} | ${pageTitle}` })

  return {
    pageTitle,
    pageDescription,
    sourceMode,
    kitchens,
    pending,
    showDevNotes,
    routePath,
    devSourceLabel,
    devKitchenCount,
    devTestProbe,
    setSourceMode,
  }
}
