import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/console/useConsoleWriteGuard'

type CreateMemberInvitationResult = {
  ok: true
  memberId: string
  memberName: string
  token: string
  expiresInDays: number
}

export function useKitchenMemberInvitationCreate() {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const createKitchenMemberInvitation = async (input: {
    kitchenId: string
    memberId: string
  }) => {
    requireWritableData()
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<CreateMemberInvitationResult>(
      '/api/console/kitchen/team/member-invitations',
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
