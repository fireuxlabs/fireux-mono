import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useAppSupportAccess } from '../../../../composables/fireux/firestore/app-support-collection'
import { usePortfolioCollection } from '../../firestore/fetch/usePortfolioCollection'

export function usePortfolioWorkspaceIndex() {
  const workspace = useWorkspace('portfolio')
  const fireux = useFireUXConfig()
  const { uid } = useAuth()
  const access = useAppSupportAccess({ db: useFirestore(), appId: computed(() => fireux.appId), collectionName: 'portfolios', accessId: uid, enabled: computed(() => Boolean(uid.value)) })
  const portfolios = usePortfolioCollection({ filter: computed(() => ({ ids: access.ids.value })) })
  const outcome = computed(() => access.outcome.value === 'pending' || access.outcome.value === 'error'
    ? access.outcome.value
    : portfolios.outcome.value)
  return { outcome, collection: portfolios.portfolios, selectedId: workspace.selectedId, select: workspace.select, clear: workspace.clear }
}
