import { computed, watch, watchEffect } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/utils/workspace-policy'
import { useKitchenWorkspaceKitchens } from '../index/useKitchenWorkspaceKitchens'

export function useKitchenWorkspace() {
  const workspace = useWorkspace('kitchen')
  const pageState = useWorkspacePageState('kitchen')
  const { isAuthenticated } = useAuth()
  const fireux = useFireUXConfig()
  const kitchens = useKitchenWorkspaceKitchens()
  const kitchenId = workspace.activeId
  const kitchen = computed(
    () =>
      kitchens.kitchens.value.find(
        (item) => normalizeString(item.id) === kitchenId.value
      ) ?? null
  )

  watch(
    kitchen,
    (selectedKitchen) =>
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

  watchEffect(() => {
    const selectedKitchen = kitchen.value
    pageState.publish({
      user: { signedIn: isAuthenticated.value },
      entity: selectedKitchen
        ? {
            id: selectedKitchen.id,
            status: selectedKitchen.status,
            name: selectedKitchen.name,
            slug: selectedKitchen.slug,
            visibility: selectedKitchen.visibility,
          }
        : null,
      derived: {
        hasSelection: Boolean(selectedKitchen),
        operationalReady: selectedKitchen?.status === 'active',
        outcome: kitchens.outcome.value,
        canWrite: canWrite.value,
        canCreate: canCreate.value,
        dataType: 'live',
      },
    })
  })

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
      canCreate,
    },
    actions: {
      selectKitchen: workspace.activate,
      clearSelectedKitchen: workspace.clearActive,
    },
  }
}
