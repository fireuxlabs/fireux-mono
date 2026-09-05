import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useAppSupportAccess } from '../../../../composables/fireux/firestore/app-support-collection'
import { usePropertyCollection } from '../../firestore/fetch/usePropertyCollection'

export function usePropertyWorkspaceIndex() {
  const workspace = useWorkspace('property')
  const fireux = useFireUXConfig()
  const { uid } = useAuth()
  const access = useAppSupportAccess({ db: useFirestore(), appId: computed(() => fireux.appId), collectionName: 'properties', accessId: uid, enabled: computed(() => Boolean(uid.value)) })
  const properties = usePropertyCollection({ filter: computed(() => ({ ids: access.ids.value })) })
  const outcome = computed(() => access.outcome.value === 'pending' || access.outcome.value === 'error'
    ? access.outcome.value
    : properties.outcome.value)
  return { outcome, collection: properties.properties, selectedId: workspace.selectedId, select: workspace.select, clear: workspace.clear }
}
