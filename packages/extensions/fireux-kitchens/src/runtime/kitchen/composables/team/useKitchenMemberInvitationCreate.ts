import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

type CreateMemberInvitationResult = {
  ok: true
  memberId: string
  memberName: string
  token: string
  expiresInDays: number
}

export function useKitchenMemberInvitationCreate() {
  const { currentUser } = useAuth()
  const createKitchenMemberInvitation = async (input: {
    kitchenId: string
    memberId: string
  }) => {
    const body = {
      kitchenId: String(input.kitchenId || '').trim(),
      memberId: String(input.memberId || '').trim(),
    }
    const uid = currentUser.value?.uid
    if (!body.kitchenId || !body.memberId)
      throw new Error('Kitchen and Team member ids are required.')
    const user = await useRequireUser()
    if (!uid || user.uid !== uid)
      throw new Error('The account changed. Try again.')
    const token = await user.getIdToken()
    if (currentUser.value?.uid !== uid)
      throw new Error('The account changed. Try again.')
    const result = await $fetch<CreateMemberInvitationResult>(
      '/api/workspace/kitchen/team/member-invitations',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      }
    )
    if (
      result.ok !== true ||
      result.memberId !== body.memberId ||
      !result.token
    )
      throw new Error('Invitation response was invalid.')
    return {
      ...result,
      link: `${window.location.origin}/kitchen/member-invitation/${encodeURIComponent(result.token)}`,
    }
  }

  return { createKitchenMemberInvitation }
}
