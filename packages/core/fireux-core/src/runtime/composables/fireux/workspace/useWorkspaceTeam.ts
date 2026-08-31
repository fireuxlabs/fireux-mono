import { computed, ref, watchEffect, type Ref } from 'vue'
import {
  targetAccessIds,
  targetOperatorIds,
  targetTeamIds,
} from './useWorkspaceAccess'

type WorkspaceTeamMember = { id: string }

type UseWorkspaceTeamOptions<Member extends WorkspaceTeamMember> = {
  target: Ref<unknown | null | undefined>
  targetId?: Ref<string | null | undefined>
  readOnly?: Ref<boolean>
  canWrite?: Ref<boolean>
  members?: Ref<readonly Member[]>
  memberLimit?: Ref<number | null>
}

export function useWorkspaceTeam<Member extends WorkspaceTeamMember>(
  options: UseWorkspaceTeamOptions<Member>
) {
  const teamIds = computed(() => targetTeamIds(options.target.value))
  const operatorIds = computed(() => targetOperatorIds(options.target.value))
  const accessIds = computed(() => targetAccessIds(options.target.value))
  const targetId = computed(() => String(options.targetId?.value ?? '').trim())
  const readOnly = computed(() => Boolean(options.readOnly?.value))
  const canWrite = computed(() => Boolean(options.canWrite?.value))
  const members = computed(() => options.members?.value ?? [])
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
    if (selectedTeamMember.value) return
    selectedTeamMemberId.value = members.value[0]?.id || ''
  })

  const debug = computed(() => ({
    targetId: targetId.value,
    teamIds: teamIds.value,
    operatorIds: operatorIds.value,
    accessIds: accessIds.value,
    teamCount: teamIds.value.length,
    operatorCount: operatorIds.value.length,
    accessCount: accessIds.value.length,
    memberCount: count.value,
    memberLimit: memberLimit.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    targetId,
    teamIds,
    operatorIds,
    accessIds,
    readOnly,
    canWrite,
    members,
    count,
    selectedTeamMember,
    selectedTeamMemberId,
    memberLimit,
    canCreateTeamMember,
    teamMemberCapacityReached,
    debug,
  }
}
