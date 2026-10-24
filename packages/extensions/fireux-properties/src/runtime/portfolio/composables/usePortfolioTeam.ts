import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
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
import { usePortfolioWorkspace } from './workspace/usePortfolioWorkspace'

type PortfolioTeamResponse = {
  ok: true
  portfolioId: string
  canManageTeam: boolean
  members: Array<{
    memberId: string
    name: string
    avatar: string
    userId: string
    roleIds: string[]
  }>
}

export function usePortfolioTeam() {
  const workspace = usePortfolioWorkspace()
  const portfolioId = workspace.id
  const { currentUser, hasAuthState } = useAuth()
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const {
    data,
    pending: requestPending,
    error: requestError,
    refresh,
  } = useLiveAsyncData<PortfolioTeamResponse>(
    computed(
      () =>
        `portfolio-team-${currentUser.value?.uid || 'anonymous'}-${portfolioId.value || 'none'}`
    ),
    async (liveFetch) => {
      const id = portfolioId.value
      const user = currentUser.value
      if (!id || !user)
        return { ok: true, portfolioId: id, canManageTeam: false, members: [] }
      return liveFetch<PortfolioTeamResponse>(
        '/api/workspace/portfolio/team/members',
        {
          query: { portfolioId: id },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
    },
    { server: false, watch: [currentUser, hasAuthState, portfolioId] }
  )
  const members = computed<WorkspaceTeamMember[]>(() =>
    (data.value && data.value.portfolioId === portfolioId.value
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
      (requestPending.value && data.value?.portfolioId !== portfolioId.value)
  )
  const error = computed<Error | undefined>(() => {
    const cause =
      requestError.value ??
      appSession.error.value ??
      (workspace.outcome.value === 'error'
        ? new Error('Portfolio workspace could not be read.')
        : undefined)
    if (!cause) return undefined
    return cause instanceof Error
      ? cause
      : new Error('Portfolio Team could not be read.')
  })
  const canWrite = computed(
    () =>
      !error.value &&
      data.value?.portfolioId === portfolioId.value &&
      data.value?.canManageTeam === true
  )
  const memberLimit = computed(() =>
    appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'portfolio.team',
      appSession.appUser.value?.subscription || 'free'
    )
  )
  const team = useWorkspaceTeam({
    workspaceId: portfolioId,
    capabilityId: 'portfolio.team',
    members,
    pending,
    error,
    canWrite,
    memberLimit,
  })
  const state = computed(() => ({
    portfolio: { id: portfolioId.value },
    team: {
      members: members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))

  async function create(input: { name: string; userId?: string }) {
    input = { ...input }
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const id = portfolioId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ memberId: string; name: string }>(
      '/api/workspace/portfolio/team/members',
      {
        method: 'POST',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${token}` },
        body: {
          portfolioId: id,
          name: input.name.trim(),
          userId: input.userId?.trim() || '',
        },
      }
    )
    if (id === portfolioId.value) {
      team.selectCreated(result.memberId)
    }
    return result
  }
  async function update(input: { memberId: string; name: string }) {
    input = { ...input }
    const id = portfolioId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    await $fetch(
      `/api/workspace/portfolio/team/members/${encodeURIComponent(input.memberId)}`,
      {
        method: 'PATCH',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${token}` },
        body: { portfolioId: id, changes: { name: input.name.trim() } },
      }
    )
  }
  async function remove(memberId: string) {
    const id = portfolioId.value
    if (!id) throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ name: string }>(
      `/api/workspace/portfolio/team/members/${encodeURIComponent(memberId)}`,
      {
        method: 'DELETE',
        retry: 0,
        timeout: 15000,
        headers: { authorization: `Bearer ${token}` },
        query: { portfolioId: id },
      }
    )
    return result
  }
  const context = computed(() => ({
    workspace: { id: portfolioId.value },
    collection: { records: members.value },
    selected: team.selectedTeamMember.value,
    derived: team.derived.value,
  }))
  const pageState = useWorkspacePageState('portfolio')
  watchEffect(() => pageState.publish(context.value))
  return {
    workspaceId: portfolioId,
    state,
    context,
    derived: team.derived,
    error,
    refresh,
    primitives: { create, update, delete: remove },
    natives: { select: team.select, selectCreated: team.selectCreated },
  }
}
