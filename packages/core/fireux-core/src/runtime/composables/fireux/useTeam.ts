import { computed, ref, watchEffect, type Ref } from 'vue'
import { defineWorkspaceCapabilityContext } from './workspace/workspaceCapabilityContext'
import type { WorkspaceCapabilityContext } from './workspace/workspaceCapabilityContext'

export type TeamAIIntent = {
  action: 'create' | 'read' | 'update' | 'delete' | 'none'
  name: string
  message: string
}

export type WorkspaceTeamMember = {
  id: string
  userId: string
  name: string
  avatar: string
  organisationRoles?: string[]
  roleIds: string[]
}

export type TeamContext = {
  state: Ref<{
    team: {
      members: readonly WorkspaceTeamMember[]
      selectedTeamMemberId: string
    }
  }>
  derived: Ref<{
    status: 'loading' | 'error' | 'ready' | 'empty'
    capability: WorkspaceCapabilityContext
  }>
  primitives: {
    create(input: {
      name: string
      userId?: string
    }): Promise<{ memberId: string; name: string }>
    update(input: { memberId: string; name: string }): Promise<unknown>
    delete(memberId: string): Promise<{ name: string }>
  }
  natives: {
    select(memberId: string): void
    selectCreated(memberId: string): void
  }
}

type WorkspaceTeamMemberIdentity = Pick<WorkspaceTeamMember, 'id'>

type UseWorkspaceTeamOptions<Member extends WorkspaceTeamMemberIdentity> = {
  workspaceId: Ref<string>
  capabilityId: string
  pending: Ref<boolean>
  error: Ref<unknown>
  members: Ref<readonly Member[]>
  canWrite: Ref<boolean>
  memberLimit?: Ref<number | null>
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
    if (options.pending.value || options.error.value) return
    if (selectedTeamMember.value) return
    selectedTeamMemberId.value = members.value[0]?.id || ''
  })

  const createdSelection = ref<{
    workspaceId: string
    memberId: string
  } | null>(null)
  watchEffect(() => {
    const target = createdSelection.value
    if (!target) return
    if (target.workspaceId !== options.workspaceId.value) {
      createdSelection.value = null
    } else if (members.value.some((member) => member.id === target.memberId)) {
      selectedTeamMemberId.value = target.memberId
      createdSelection.value = null
    }
  })
  function select(memberId: string) {
    selectedTeamMemberId.value = members.value.some(
      (member) => member.id === memberId
    )
      ? memberId
      : ''
  }
  function selectCreated(memberId: string) {
    createdSelection.value = {
      workspaceId: options.workspaceId.value,
      memberId,
    }
  }
  const derived = computed<TeamContext['derived']['value']>(() => {
    const status = options.error.value
      ? 'error'
      : options.pending.value
        ? 'loading'
        : options.workspaceId.value
          ? 'ready'
          : 'empty'
    const ready = status === 'ready'
    const canEdit = ready && canWrite.value && Boolean(selectedTeamMember.value)
    return {
      status,
      capability: defineWorkspaceCapabilityContext({
        id: options.capabilityId,
        subject: 'Team member',
        primitives: {
          create: {
            available: ready && canCreateTeamMember.value,
            limit: memberLimit.value,
          },
          read: { available: ready && count.value > 0, count: count.value },
          update: { available: canEdit },
          delete: { available: canEdit },
        },
        natives: [
          { id: 'link-existing-user', primitive: 'create' },
          { id: 'add-unlinked-name', primitive: 'create' },
          { id: 'enrich-linked-identity', primitive: 'read' },
        ],
      }),
    }
  })

  return {
    derived,
    select,
    selectCreated,
    members,
    count,
    selectedTeamMember,
    selectedTeamMemberId,
    memberLimit,
    canCreateTeamMember,
    teamMemberCapacityReached,
  }
}
