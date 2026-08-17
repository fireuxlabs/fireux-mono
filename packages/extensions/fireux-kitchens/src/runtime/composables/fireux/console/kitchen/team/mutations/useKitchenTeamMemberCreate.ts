import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'

type CreateKitchenTeamMemberInput = {
  kitchenId: string
  name: string
}

type CreateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
  slug: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenTeamMemberCreate() {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')

  const createKitchenTeamMember = async (
    input: CreateKitchenTeamMemberInput
  ) => {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchenId)
    const name = normalizeString(input.name)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!name) throw new Error('Team member name is required')
    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<CreateKitchenTeamMemberResult>(
      '/api/console/kitchen/team/members',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { kitchenId, name },
      }
    )
    if (result.ok !== true || !result.memberId) {
      throw new Error('Add team member response was invalid.')
    }

    return result
  }

  return { createKitchenTeamMember }
}
