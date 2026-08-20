import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'

type CreateMemberInvitationResult = {
  ok: true
  memberId: string
  memberName: string
  token: string
  expiresInDays: number
}

export function useKitchenMemberInvitationCreate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const createKitchenMemberInvitation = async (input: {
    kitchenId: string
    memberId: string
  }) => {
    requireWritableData()
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<CreateMemberInvitationResult>(
      '/api/workspace/kitchen/team/member-invitations',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: input,
      }
    )
    if (!result.token) throw new Error('Invitation response was invalid.')
    return {
      ...result,
      link: `${window.location.origin}/kitchen/member-invitation/${encodeURIComponent(result.token)}`,
    }
  }

  return { createKitchenMemberInvitation }
}
