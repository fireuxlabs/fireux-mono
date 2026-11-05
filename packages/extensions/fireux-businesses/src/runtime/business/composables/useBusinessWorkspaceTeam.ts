import { refreshNuxtData, useAsyncData, type AsyncData } from 'nuxt/app'

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
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useBusinessWorkspace } from './useBusinessWorkspace'

type BusinessTeamResponse = {
  ok: true
  businessId: string
  canManageTeam: boolean
  members: Array<{
    memberId: string
    name: string
    avatar: string
    userId: string
    roleIds: string[]
  }>
}

export function useBusinessWorkspaceTeam() {
  const workspace = useBusinessWorkspace()
  const businessId = workspace.id
  const { currentUser, hasAuthState } = useAuth()
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const capture = useCommandScope([() => currentUser.value?.uid, appSession.appUser, businessId])
  const {
    data,
    pending: requestPending,
    error: requestError,
    refresh,
  } = useAsyncData<BusinessTeamResponse>(
    computed(
      () =>
        `business-team-${currentUser.value?.uid || 'anonymous'}-${businessId.value || 'none'}`
    ),
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      const id = businessId.value
      const user = currentUser.value
      if (!id || !user)
        return { ok: true, businessId: id, canManageTeam: false, members: [] }
      return fetchRead<BusinessTeamResponse>('/api/workspace/business/team', {
        query: { businessId: id },
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      })
    },
    { server: false, watch: [currentUser, hasAuthState, businessId] }
  )
  const members = computed<WorkspaceTeamMember[]>(() =>
    (!pending.value &&
    !error.value &&
    data.value &&
    data.value.businessId === businessId.value
      ? data.value.members
      : []
    ).map((member: BusinessTeamResponse['members'][number]) => ({
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
      (requestPending.value && data.value?.businessId !== businessId.value)
  )
  const error = computed<Error | undefined>(() => {
    const cause =
      requestError.value ??
      appSession.error.value ??
      (workspace.outcome.value === 'error'
        ? new Error('Business workspace could not be read.')
        : undefined)
    if (!cause) return undefined
    return cause instanceof Error
      ? cause
      : new Error('Business Team could not be read.')
  })
  const canWrite = computed(
    () =>
      !error.value &&
      data.value?.businessId === businessId.value &&
      data.value?.canManageTeam === true
  )
  const memberLimit = computed(() =>
    appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'business.team',
      appSession.appUser.value?.subscription || 'free'
    )
  )
  const team = useWorkspaceTeam({
    workspaceId: businessId,
    capabilityId: 'business.team',
    members,
    pending,
    error,
    canWrite,
    memberLimit,
  })
  const state = computed(() => ({
    business: { id: businessId.value },
    team: {
      members: members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))

  async function create(input: { name: string; userId?: string }) {
    input = { ...input }
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const id = businessId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const isCurrent = capture()
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (!isCurrent() || user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ memberId: string; name: string }>(
      '/api/workspace/business/team',
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
          businessId: id,
          name: input.name.trim(),
          userId: input.userId?.trim() || '',
        },
      }
    )
    if (isCurrent() && id === businessId.value) {
      team.selectCreated(result.memberId)
    }
    return result
  }
  async function update(input: { memberId: string; name: string }) {
    input = { ...input }
    const id = businessId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const isCurrent = capture()
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (!isCurrent() || user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    await $fetch(
      '/api/workspace/business/team',
      {
        onResponse: async ({ response }) => {
          if (response.ok) await refreshNuxtData()
        },
        method: 'PATCH',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${token}` },
        body: { businessId: id, memberId: input.memberId, changes: { name: input.name.trim() } },
      }
    )
  }
  async function remove(memberId: string) {
    const id = businessId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const isCurrent = capture()
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (!isCurrent() || user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ name: string }>(
      '/api/workspace/business/team',
      {
        onResponse: async ({ response }) => {
          if (response.ok) await refreshNuxtData()
        },
        method: 'DELETE',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${token}` },
        body: { businessId: id, memberId },
      }
    )
    return result
  }
  const context = computed(() => ({
    workspace: { id: businessId.value },
    collection: { records: members.value },
    selected: team.selectedTeamMember.value,
    derived: team.derived.value,
  }))
  const pageState = useWorkspacePageState('business')
  watchEffect(() => pageState.publish(context.value))
  return {
    workspaceId: businessId,
    state,
    context,
    derived: team.derived,
    error,
    refresh: refresh as AsyncData<unknown, unknown>['refresh'],
    primitives: { create, update, delete: remove },
    natives: { select: team.select, selectCreated: team.selectCreated },
  }
}
