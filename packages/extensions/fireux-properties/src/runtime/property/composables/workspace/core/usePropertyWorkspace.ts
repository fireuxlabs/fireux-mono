import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { PropertyStorage } from '../../../models/property.model.ts'
import { useAppSupportAccess } from '../../../../composables/fireux/firestore/app-support-collection'
import { usePropertyCollection } from '../../firestore/fetch/usePropertyCollection'
import type { PropertySurface } from '../../firestore/utils/view/usePropertyInterface'

function createPropertyWorkspace() {
  const workspace = useWorkspace('property')
  const fireux = useFireUXConfig()
  const { uid } = useAuth()
  const access = useAppSupportAccess({
    db: useFirestore(),
    appId: computed(() => fireux.appId),
    collectionName: 'properties',
    accessId: uid,
    enabled: computed(() => Boolean(uid.value)),
  })
  const collection = usePropertyCollection({
    filter: computed(() => ({ ids: access.ids.value })),
  })
  const property = computed<PropertySurface | null>(
    () =>
      collection.properties.value.find(
        (item) => normalizeString(item.id) === workspace.currentId.value
      ) ?? null
  )
  const canWrite = computed(() => targetHasOperator(property.value, uid.value))

  return {
    properties: {
      targets: collection.properties,
      count: collection.count,
      pending: collection.pending,
      error: collection.error,
      outcome: computed(() =>
        access.outcome.value === 'ready'
          ? collection.outcome.value
          : access.outcome.value
      ),
    },
    selection: {
      property,
      propertyId: workspace.currentId,
      hasSelection: computed(() => Boolean(property.value)),
    },
    runtime: {
      appId: computed(() => fireux.appId),
      ecosystem: computed(() => fireux.ecosystem),
      rootCollection: computed(() => PropertyStorage.rootCollection),
      dataType: computed(() => 'live' as const),
      isDemo: computed(() => false),
      readOnly: computed(() => !canWrite.value),
      canWrite,
    },
    actions: {
      selectProperty: workspace.setCurrent,
      clearSelectedProperty: workspace.clearCurrent,
    },
  }
}

export function usePropertyWorkspace() {
  return createPropertyWorkspace()
}
