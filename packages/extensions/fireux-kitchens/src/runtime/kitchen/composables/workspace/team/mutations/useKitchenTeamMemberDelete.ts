import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

export function useKitchenTeamMemberDelete() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')

  async function deleteKitchenTeamMember(kitchenId: string, memberId: string) {
    requireWritableData()
    const user = await useRequireUser()
    const token = await user.getIdToken()
    return $fetch<{ ok: true; memberId: string; name: string }>(
      `/api/workspace/kitchen/team/members/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        query: { kitchenId },
      }
    )
  }

  return { deleteKitchenTeamMember }
}
