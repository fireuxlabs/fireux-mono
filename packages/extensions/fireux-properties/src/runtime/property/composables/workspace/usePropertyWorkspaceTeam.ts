import { refreshNuxtData, useAsyncData } from 'nuxt/app'

import { computed, watchEffect } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { appSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import {
  useWorkspaceTeam,
  type WorkspaceTeamMember,
} from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { usePropertyWorkspace } from './usePropertyWorkspace'

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

export function usePropertyWorkspaceTeam() {
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
  } = useAsyncData<PropertyTeamResponse>(
    computed(
      () =>
        `property-team-${currentUser.value?.uid || 'anonymous'}-${propertyId.value || 'none'}`
    ),
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const id = propertyId.value
      const user = currentUser.value
      if (!id || !user)
        return { ok: true, propertyId: id, canManageTeam: false, members: [] }
      return fetchRead<PropertyTeamResponse>(
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
    (!pending.value &&
    !error.value &&
    data.value &&
    data.value.propertyId === propertyId.value
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
  const team = useWorkspaceTeam({
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
    input = { ...input }
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const id = propertyId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ memberId: string; name: string }>(
      '/api/workspace/property/team/members',
      {
        onResponse: async ({ options, response }) => {
          if (
            response.ok &&
            !['GET', 'HEAD'].includes(
              String(options.method || 'GET').toUpperCase()
            )
          )
            await refreshNuxtData()
        },
        method: 'POST',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${token}` },
        body: {
          propertyId: id,
          name: input.name.trim(),
          userId: input.userId?.trim() || '',
        },
      }
    )
    if (id === propertyId.value) {
      team.selectCreated(result.memberId)
    }
    return result
  }
  async function update(input: { memberId: string; name: string }) {
    input = { ...input }
    const id = propertyId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    await $fetch(
      `/api/workspace/property/team/members/${encodeURIComponent(input.memberId)}`,
      {
        onResponse: async ({ response }) => {
          if (response.ok) await refreshNuxtData()
        },
        method: 'PATCH',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${token}` },
        body: { propertyId: id, changes: { name: input.name.trim() } },
      }
    )
  }
  async function remove(memberId: string) {
    const id = propertyId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ name: string }>(
      `/api/workspace/property/team/members/${encodeURIComponent(memberId)}`,
      {
        onResponse: async ({ response }) => {
          if (response.ok) await refreshNuxtData()
        },
        method: 'DELETE',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${token}` },
        query: { propertyId: id },
      }
    )
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
    workspaceId: propertyId,
    state,
    context,
    derived: team.derived,
    error,
    refresh,
    primitives: { create, update, delete: remove },
    natives: { select: team.select, selectCreated: team.selectCreated },
  }
}
