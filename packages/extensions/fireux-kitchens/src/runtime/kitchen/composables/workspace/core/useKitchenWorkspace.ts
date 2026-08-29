import { computed, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/utils/workspace-policy'
import type { KitchenSurface } from '../../firestore/utils/view/useKitchenInterface'
import { useKitchenWorkspaceKitchens } from '../index/useKitchenWorkspaceKitchens'

export function useKitchenWorkspace() {
  const workspace = useWorkspace('kitchen')
  const fireux = useFireUXConfig()
  const { currentUser } = useAuth()
  const { canOwnMultipleWorkspaces } = useUser()
  const kitchens = useKitchenWorkspaceKitchens()
  const kitchenId = workspace.activeId
  const kitchen = computed<KitchenSurface | null>(
    () =>
      kitchens.kitchens.value.find(
        (item) => normalizeString(item.id) === kitchenId.value
      ) ?? null
  )

  watch(
    kitchen,
    (selectedKitchen: KitchenSurface | null) =>
      workspace.setActiveStatus(selectedKitchen?.status || ''),
    { immediate: true }
  )

  watch(
    [kitchenId, kitchen, kitchens.outcome],
    (values: [string, unknown, string]) => {
      const [id, activeEntity, outcome] = values
      if (!id || activeEntity || (outcome !== 'ready' && outcome !== 'empty'))
        return
      workspace.clearActive()
    },
    { immediate: true }
  )

  const canWrite = computed(() => kitchen.value?.can_write === true)
  const canCreate = computed(() =>
    resolveWorkspaceCanCreate(fireux.role, fireux.workspaceConfig, 'kitchen')
  )
  const rootCollection = computed(() => 'kitchens')

  return {
    user: {
      currentUser,
      canOwnMultipleWorkspaces,
    },
    targets: kitchens,
    selection: {
      kitchen,
      kitchenId,
      kitchenSource: computed(() => 'live' as const),
      hasSelection: computed(() => Boolean(kitchen.value)),
    },
    runtime: {
      appId: computed(() => fireux.appId),
      ecosystem: computed(() => fireux.ecosystem),
      source: computed(() => 'live' as const),
      dataType: computed(() => 'live' as const),
      rootCollection,
      isDemo: computed(() => false),
      readOnly: computed(() => false),
      canWrite,
      canCreate,
      canonicalRootCollection: rootCollection,
      collectionPath: rootCollection,
      kitchenCollectionPath: rootCollection,
      storageKitchenId: kitchenId,
      databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
      isTenant: computed(() => fireux.isTenant),
      isGlobal: computed(() => !fireux.isTenant && !fireux.isStandalone),
    },
    actions: {
      selectKitchen: workspace.activate,
      clearSelectedKitchen: workspace.clearActive,
    },
  }
}
