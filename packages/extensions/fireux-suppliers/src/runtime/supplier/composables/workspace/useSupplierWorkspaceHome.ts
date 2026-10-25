import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
type Member = { id?: string; memberId?: string; name: string; avatar: string }
import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/workspace/models/outcome'
import { useSupplierWorkspace } from './useSupplierWorkspace'

export function useSupplierWorkspaceHome() {
  const workspace = useSupplierWorkspace()
  const selectedSupplier = computed(() =>
    workspace.outcome.value === 'ready' &&
    workspace.collectionOutcome.value === 'ready'
      ? (workspace.collection.value.find(
          (supplier) => supplier.id === workspace.id.value
        ) ?? null)
      : null
  )
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    if (workspace.collectionOutcome.value === 'empty') return 'empty'
    if (workspace.collectionOutcome.value !== 'ready')
      return workspace.collectionOutcome.value
    return selectedSupplier.value ? 'ready' : 'empty'
  })
  const { focus } = useOverview({
    entity: selectedSupplier,
    id: workspace.id,
    outcome,
  })
  const multiple = computed(() => ({
    items: workspace.collection.value,
    count: workspace.collection.value.length,
    hasItems: workspace.collection.value.length > 0,
    outcome: workspace.collectionOutcome.value,
  }))

  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `supplier-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}-${workspace.outcome.value}`
  )
  const { data, status, error } = useLiveAsyncData(
    key,
    async (liveFetch) => {
      const id = workspace.outcome.value === 'ready' ? workspace.id.value : ''
      const user = currentUser.value
      if (!id || !user) return null
      return liveFetch<{ supplierId: string; members: Member[] }>(
        '/api/workspace/supplier/team/members',
        {
          query: { supplierId: id },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false }
  )
  const team = {
    members: computed(() =>
      workspace.outcome.value === 'ready' &&
      !error.value &&
      status.value === 'success' &&
      data.value &&
      data.value.supplierId === workspace.id.value
        ? data.value.members
        : []
    ),
    pending: computed(
      () => status.value === 'pending' || status.value === 'idle'
    ),
    error,
  }
  return {
    team,
    focus,
    multiple,
    outcome,
    selectedSupplier,
    supplierId: workspace.id,
  }
}
