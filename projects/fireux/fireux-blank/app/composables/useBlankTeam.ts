import { computed, watchEffect } from 'vue'
import { useAsyncData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import {
  useTeam,
  type WorkspaceTeamMember,
} from 'fireux-core/runtime/composables/fireux/useTeam'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { useBlankWorkspace } from './fireux/workspace/blank/core/useBlankWorkspace'

type BlankTeamResponse = {
  ok: true
  blankId: string
  canManageTeam: boolean
  members: Array<{
    memberId: string
    name: string
    avatar: string
    userId: string
    roleIds: string[]
  }>
}

export function useBlankTeam() {
  const workspace = useBlankWorkspace()
  const blankId = workspace.id
  const { currentUser, hasAuthState } = useAuth()
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const {
    data,
    pending: requestPending,
    error: requestError,
    refresh,
  } = useAsyncData<BlankTeamResponse>(
    computed(
      () =>
        `blank-team-${currentUser.value?.uid || 'anonymous'}-${blankId.value || 'none'}`
    ),
    async () => {
      const id = blankId.value
      const user = currentUser.value
      if (!id || !user)
        return { ok: true, blankId: id, canManageTeam: false, members: [] }
      return $fetch<BlankTeamResponse>('/api/workspace/blank/team/members', {
        query: { blankId: id },
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      })
    },
    { server: false, watch: [currentUser, hasAuthState, blankId] }
  )
  const members = computed<WorkspaceTeamMember[]>(() =>
    (data.value?.blankId === blankId.value ? data.value.members : []).map(
      (member: BlankTeamResponse['members'][number]) => ({
        id: member.memberId,
        name: member.name,
        userId: member.userId,
        avatar: member.avatar,
        roleIds: member.roleIds,
      })
    )
  )
  const pending = computed(
    () =>
      !hasAuthState.value ||
      appSession.pending.value ||
      workspace.outcome.value === 'pending' ||
      (requestPending.value && data.value?.blankId !== blankId.value)
  )
  const error = computed<Error | undefined>(() => {
    const cause =
      requestError.value ??
      appSession.error.value ??
      (workspace.outcome.value === 'error'
        ? new Error('Blank workspace could not be read.')
        : undefined)
    if (!cause) return undefined
    return cause instanceof Error
      ? cause
      : new Error('Blank Team could not be read.')
  })
  const canWrite = computed(
    () =>
      !error.value &&
      data.value?.blankId === blankId.value &&
      data.value?.canManageTeam === true
  )
  const memberLimit = computed(() =>
    appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'blank.team',
      appSession.appUser.value?.subscription || 'free'
    )
  )
  const team = useTeam({
    workspaceId: blankId,
    capabilityId: 'blank.team',
    members,
    pending,
    error,
    canWrite,
    memberLimit,
  })
  const state = computed(() => ({
    blank: { id: blankId.value },
    team: {
      members: members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))

  async function create(input: { name: string; userId?: string }) {
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const id = blankId.value
    const user = await useRequireUser()
    const result = await $fetch<{ memberId: string; name: string }>(
      '/api/workspace/blank/team/members',
      {
        method: 'POST',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          blankId: id,
          name: input.name.trim(),
          userId: input.userId?.trim() || '',
        },
      }
    )
    if (id === blankId.value) {
      team.selectCreated(result.memberId)
      await refresh()
    }
    return result
  }
  async function update(input: { memberId: string; name: string }) {
    const id = blankId.value
    const user = await useRequireUser()
    await $fetch(
      `/api/workspace/blank/team/members/${encodeURIComponent(input.memberId)}`,
      {
        method: 'PATCH',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: { blankId: id, changes: { name: input.name.trim() } },
      }
    )
    if (id === blankId.value) await refresh()
  }
  async function remove(memberId: string) {
    const id = blankId.value
    const user = await useRequireUser()
    const result = await $fetch<{ name: string }>(
      `/api/workspace/blank/team/members/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        query: { blankId: id },
      }
    )
    if (id === blankId.value) await refresh()
    return result
  }
  const context = computed(() => ({
    workspace: { id: blankId.value },
    collection: { records: members.value },
    selected: team.selectedTeamMember.value,
    derived: team.derived.value,
  }))
  const pageState = useWorkspacePageState('blank')
  watchEffect(() => pageState.publish(context.value))
  return {
    state,
    context,
    derived: team.derived,
    error,
    refresh,
    primitives: { create, update, delete: remove },
    natives: { select: team.select, selectCreated: team.selectCreated },
  }
}
