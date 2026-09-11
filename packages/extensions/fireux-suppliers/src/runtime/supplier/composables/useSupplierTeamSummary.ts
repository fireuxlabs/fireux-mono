import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useSupplierWorkspace } from './workspace/core/useSupplierWorkspace'

type Member = { id?: string; memberId?: string; name: string; avatar: string }
export function useSupplierTeamSummary() {
  const workspace = useSupplierWorkspace()
  const { currentUser } = useAuth()
  const key = computed(
    () =>
      `supplier-team-summary-${currentUser.value?.uid || ''}-${workspace.id.value}`
  )
  const { data, status, error } = useLiveAsyncData(
    key,
    async (liveFetch) => {
      const id = workspace.id.value
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
  return {
    members: computed(() =>
      data.value && data.value.supplierId === workspace.id.value
        ? data.value.members
        : []
    ),
    pending: computed(
      () => status.value === 'pending' || status.value === 'idle'
    ),
    error,
  }
}
