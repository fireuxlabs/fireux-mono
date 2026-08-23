import { computed, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenWorkspaceKitchens } from '../index/useKitchenWorkspaceKitchens'

export function useKitchenWorkspace() {
  const workspace = useWorkspace('kitchen')
  const fireux = useFireUXConfig()
  const kitchens = useKitchenWorkspaceKitchens()
  const kitchenId = workspace.currentId
  const kitchen = computed(
    () =>
      kitchens.kitchens.value.find(
        item => normalizeString(item.id) === kitchenId.value
      ) ?? null
  )

  watch(
    [kitchenId, kitchen, kitchens.outcome],
    ([id, selected, outcome]) => {
      if (!id || selected || (outcome !== 'ready' && outcome !== 'empty')) return
      workspace.clearCurrent()
    },
    { immediate: true }
  )

  const canWrite = computed(() => kitchen.value?.can_write === true)
  const rootCollection = computed(() => 'kitchens')

  return {
    targets: kitchens,
    selection: {
      kitchen,
      kitchenId,
      kitchenSource: computed(() => 'live' as const),
      hasSelection: computed(() => Boolean(kitchen.value)),
    },
    runtime: {
      appId: computed(() => fireux.appId),
      source: computed(() => 'live' as const),
      dataType: computed(() => 'live' as const),
      canonicalRootCollection: rootCollection,
      collectionPath: rootCollection,
      kitchenCollectionPath: rootCollection,
      rootCollection,
      storageKitchenId: kitchenId,
      databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
      isTenant: computed(() => fireux.isTenant),
      isGlobal: computed(() => !fireux.isTenant && !fireux.isStandalone),
      isDemo: computed(() => false),
      readOnly: computed(() => false),
      canWrite,
      canCreate: computed(() => true),
    },
    actions: {
      selectKitchen: workspace.setCurrent,
      clearSelectedKitchen: workspace.clearCurrent,
    },
  }
}
