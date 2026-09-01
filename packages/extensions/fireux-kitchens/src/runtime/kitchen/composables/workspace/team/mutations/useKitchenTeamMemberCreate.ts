import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'

type CreateKitchenTeamMemberInput = {
  kitchenId: string
  name: string
  userId?: string
  role?: string
  station?: string
  certifications?: string[]
  notes?: string
}

type CreateKitchenTeamMemberResult = {
  ok: true
  memberId: string
  name: string
  slug: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenTeamMemberCreate() {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')

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
      '/api/workspace/kitchen/team/members',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          kitchenId,
          name,
          userId: normalizeString(input.userId),
          role: normalizeString(input.role),
          station: normalizeString(input.station),
          certifications: input.certifications || [],
          notes: normalizeString(input.notes),
        },
      }
    )
    if (result.ok !== true || !result.memberId) {
      throw new Error('Add team member response was invalid.')
    }

    return result
  }

  return { createKitchenTeamMember }
}
