import { computed, isRef } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  resolveConsoleCanWrite,
  resolveConsoleRootCollection,
  useConsole,
  type ConsoleMode,
} from 'fireux-core/runtime/composables/fireux/console/useConsole'
import {
  readRuntimeFirestoreDatabaseId,
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  usePublishConsoleHeader,
  type ConsoleHeaderData,
} from 'fireux-core/runtime/composables/fireux/console/useConsoleHeader'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useKitchenCollection,
  type KitchenCollectionFilter,
} from '../../firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenFetch } from '../../firestore/kitchen/fetch/useKitchenFetch'
import { type KitchenSurface } from '../../firestore/kitchen/utils/view/useKitchenInterface'
import type { Ref } from 'vue'

type KitchenConsoleMode = ConsoleMode
type KitchenConsoleEntity = KitchenSurface
type UseKitchenConsoleOptions = {
  filter?: KitchenCollectionFilter | Ref<KitchenCollectionFilter | null | undefined> | null
}

export function useKitchenConsole(
  options: UseKitchenConsoleOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const liveFilter = computed<KitchenCollectionFilter>(() => {
    const explicitFilter = isRef(options.filter)
      ? options.filter.value ?? {}
      : options.filter ?? {}

    return {
      ...explicitFilter,
      teamId: userId.value,
    }
  })
  const { kitchens: liveKitchens } = useKitchenCollection({
    filter: liveFilter,
  })
  const { kitchens: demoKitchens } = useKitchenCollection({ source: 'demo' })
  const { kitchen: testKitchen } = useKitchenFetch(userId, { source: 'test' })
  const { selectedEntity, selectedMode, selectEntity, clearSelection } = useConsole<
    KitchenSurface,
    KitchenSurface,
    KitchenSurface
  >('kitchens', {
    liveItems: liveKitchens,
    demoItems: demoKitchens,
    testItem: testKitchen,
    getId: (kitchen) => normalizeString(kitchen?.id),
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(() => selectedEntity.value)
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const databaseId = computed(() =>
    selectedMode.value === 'live'
      ? readRuntimeFirestoreDatabaseId() || ''
      : selectedMode.value === 'test'
        ? readRuntimeSimulationFirestoreDatabaseId() || ''
        : ''
  )
  const rootCollection = computed(() =>
    selectedMode.value === 'demo'
      ? ''
      : selectedMode.value === 'test'
        ? 'kitchens'
        : resolveConsoleRootCollection('kitchens', selectedMode.value)
  )
  const canWrite = computed(() => resolveConsoleCanWrite(selectedMode.value))

  const header = computed<ConsoleHeaderData>(() => {
    const kitchen = selectedKitchen.value
    if (!kitchen) return null

    if (selectedMode.value === 'demo') {
      return {
        title: normalizeString(kitchen.name),
        subtitle: normalizeString((kitchen as any).tagline) || undefined,
        imageUrl: normalizeString(kitchen.image_url) || undefined,
      }
    }

    if (selectedMode.value === 'test') {
      return {
        title: 'Test Kitchen',
        subtitle: normalizeString((kitchen as any).tagline) || undefined,
        imageUrl: normalizeString(kitchen.image_url) || undefined,
      }
    }

    return {
      title: normalizeString(kitchen.name),
      subtitle: normalizeString((kitchen as any).tagline) || undefined,
      imageUrl: normalizeString(kitchen.image_url) || undefined,
    }
  })

  usePublishConsoleHeader('kitchens', header)

  const clearSelectedKitchen = () => {
    clearSelection()
  }

  const selectKitchen = (kitchenId: string, mode: KitchenConsoleMode = 'live') => {
    selectEntity(kitchenId, mode)
  }

  return {
    liveKitchens,
    demoKitchens,
    testKitchen,
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    databaseId,
    canWrite,
    clearSelectedKitchen,
    selectKitchen,
  }
}
