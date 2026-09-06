import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'

type UpdateKitchenTeamMemberInput = {
  kitchenId: string
  memberId: string
  changes: {
    name: string
    role?: 'operator' | 'member'
    jobTitle?: string
  }
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
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')

  const updateKitchenTeamMember = async (
    input: UpdateKitchenTeamMemberInput
  ) => {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchenId)
    const memberId = normalizeString(input.memberId)
    const name = normalizeString(input.changes.name)
    const role = normalizeString(input.changes.role)
    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!memberId) throw new Error('Team member id is required')
    if (!name) throw new Error('Team member name is required')
    if (role && role !== 'operator' && role !== 'member') {
      throw new Error('Team member role must be operator or member')
    }

    const user = await useRequireUser()
    const token = await user.getIdToken()
    const result = await $fetch<UpdateKitchenTeamMemberResult>(
      `/api/workspace/kitchen/team/members/${encodeURIComponent(memberId)}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          kitchenId,
          changes: {
            name,
            ...(role ? { role } : {}),
            ...(input.changes.jobTitle !== undefined
              ? { jobTitle: input.changes.jobTitle }
              : {}),
          },
        },
      }
    )
    if (result.ok !== true || result.memberId !== memberId) {
      throw new Error('Update team member response was invalid.')
    }
    return result
  }

  return { updateKitchenTeamMember }
}
