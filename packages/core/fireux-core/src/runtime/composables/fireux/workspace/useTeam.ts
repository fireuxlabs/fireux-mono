import { computed, ref, watchEffect, type Ref } from 'vue'

export type TeamAIIntent = {
  action: 'create' | 'read' | 'update' | 'delete' | 'none'
  name: string
  role?: '' | 'operator' | 'member'
  message: string
}

export type WorkspaceTeamMemberRole = 'owner' | 'operator' | 'member'
export type WorkspaceTeamMemberStatus = 'active' | 'inactive'

export type WorkspaceTeamMember = {
  id: string
  userId: string
  name: string
  avatar: string
  role: WorkspaceTeamMemberRole
  status: WorkspaceTeamMemberStatus
}

type WorkspaceTeamMemberIdentity = Pick<WorkspaceTeamMember, 'id'>

type UseWorkspaceTeamOptions<Member extends WorkspaceTeamMemberIdentity> = {
  members: Ref<readonly Member[]>
  canWrite: Ref<boolean>
  memberLimit?: Ref<number | null>
  settled?: Ref<boolean>
}

export function useTeam<Member extends WorkspaceTeamMemberIdentity>(
  options: UseWorkspaceTeamOptions<Member>
) {
  const canWrite = computed(() => options.canWrite.value)
  const members = computed(() => options.members.value)
  const selectedTeamMemberId = ref('')
  const selectedTeamMember = computed(
    () =>
      members.value.find(
        (member: Member) => member.id === selectedTeamMemberId.value
      ) ?? null
  )
  const count = computed(() => members.value.length)
  const memberLimit = computed(() => options.memberLimit?.value ?? null)
  const canCreateTeamMember = computed(
    () =>
      canWrite.value &&
      (memberLimit.value === null || count.value < memberLimit.value)
  )
  const teamMemberCapacityReached = computed(
    () => canWrite.value && !canCreateTeamMember.value
  )

  watchEffect(() => {
    if (options.settled && !options.settled.value) return
    if (selectedTeamMember.value) return
    selectedTeamMemberId.value = members.value[0]?.id || ''
  })

  return {
    members,
    count,
    selectedTeamMember,
    selectedTeamMemberId,
    memberLimit,
    canCreateTeamMember,
    teamMemberCapacityReached,
  }
}
