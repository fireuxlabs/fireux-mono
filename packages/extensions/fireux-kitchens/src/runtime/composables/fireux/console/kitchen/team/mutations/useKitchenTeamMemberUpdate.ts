import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

type UpdateKitchenTeamMemberInput = {
  kitchenId: string
  memberId: string
  name: string
}

type UpdateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
  slug: string
}

const normalizeString = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')

export function useKitchenTeamMemberUpdate() {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')

  const updateKitchenTeamMember = async (
    input: UpdateKitchenTeamMemberInput
  ) => {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchenId)
    const memberId = normalizeString(input.memberId)
    const name = normalizeString(input.name)
    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!memberId) throw new Error('Team member id is required')
    if (!name) throw new Error('Team member name is required')

    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<UpdateKitchenTeamMemberResult>(
      `/api/console/kitchen/team/members/${encodeURIComponent(memberId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchenId, name },
      }
    )
    if (result.ok !== true || result.memberId !== memberId) {
      throw new Error('Update team member response was invalid.')
    }
    return result
  }

  return { updateKitchenTeamMember }
}
