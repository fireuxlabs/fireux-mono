import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, watchEffect } from 'vue'
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
import { usePropertyWorkspace } from './workspace/core/usePropertyWorkspace'

type PropertyTeamResponse = {
  ok: true
  propertyId: string
  canManageTeam: boolean
  members: Array<{
    memberId: string
    name: string
    avatar: string
    userId: string
    roleIds: string[]
  }>
}

export function usePropertyTeam() {
  const workspace = usePropertyWorkspace()
  const propertyId = workspace.id
  const { currentUser, hasAuthState } = useAuth()
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const {
    data,
    pending: requestPending,
    error: requestError,
    refresh,
  } = useLiveAsyncData<PropertyTeamResponse>(
    computed(
      () =>
        `property-team-${currentUser.value?.uid || 'anonymous'}-${propertyId.value || 'none'}`
    ),
    async (liveFetch) => {
      const id = propertyId.value
      const user = currentUser.value
      if (!id || !user)
        return { ok: true, propertyId: id, canManageTeam: false, members: [] }
      return liveFetch<PropertyTeamResponse>(
        '/api/workspace/property/team/members',
        {
          query: { propertyId: id },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false, watch: [currentUser, hasAuthState, propertyId] }
  )
  const members = computed<WorkspaceTeamMember[]>(() =>
    (data.value && data.value.propertyId === propertyId.value
      ? data.value.members
      : []
    ).map((member) => ({
      id: member.memberId,
      name: member.name,
      userId: member.userId,
      avatar: member.avatar,
      roleIds: member.roleIds,
    }))
  )
  const pending = computed(
    () =>
      !hasAuthState.value ||
      appSession.pending.value ||
      workspace.outcome.value === 'pending' ||
      (requestPending.value && data.value?.propertyId !== propertyId.value)
  )
  const error = computed<Error | undefined>(() => {
    const cause =
      requestError.value ??
      appSession.error.value ??
      (workspace.outcome.value === 'error'
        ? new Error('Property workspace could not be read.')
        : undefined)
    if (!cause) return undefined
    return cause instanceof Error
      ? cause
      : new Error('Property Team could not be read.')
  })
  const canWrite = computed(
    () =>
      !error.value &&
      data.value?.propertyId === propertyId.value &&
      data.value?.canManageTeam === true
  )
  const memberLimit = computed(() =>
    appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'property.team',
      appSession.appUser.value?.subscription || 'free'
    )
  )
  const team = useTeam({
    workspaceId: propertyId,
    capabilityId: 'property.team',
    members,
    pending,
    error,
    canWrite,
    memberLimit,
  })
  const state = computed(() => ({
    property: { id: propertyId.value },
    team: {
      members: members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))

  async function create(input: { name: string; userId?: string }) {
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const id = propertyId.value
    const user = await useRequireUser()
    const result = await $fetch<{ memberId: string; name: string }>(
      '/api/workspace/property/team/members',
      {
        method: 'POST',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          propertyId: id,
          name: input.name.trim(),
          userId: input.userId?.trim() || '',
        },
      }
    )
    if (id === propertyId.value) {
      team.selectCreated(result.memberId)
      await refresh()
    }
    return result
  }
  async function update(input: { memberId: string; name: string }) {
    const id = propertyId.value
    const user = await useRequireUser()
    await $fetch(
      `/api/workspace/property/team/members/${encodeURIComponent(input.memberId)}`,
      {
        method: 'PATCH',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: { propertyId: id, changes: { name: input.name.trim() } },
      }
    )
    if (id === propertyId.value) await refresh()
  }
  async function remove(memberId: string) {
    const id = propertyId.value
    const user = await useRequireUser()
    const result = await $fetch<{ name: string }>(
      `/api/workspace/property/team/members/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        query: { propertyId: id },
      }
    )
    if (id === propertyId.value) await refresh()
    return result
  }
  const context = computed(() => ({
    workspace: { id: propertyId.value },
    collection: { records: members.value },
    selected: team.selectedTeamMember.value,
    derived: team.derived.value,
  }))
  const pageState = useWorkspacePageState('property')
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
