import { refreshNuxtData, useAsyncData } from 'nuxt/app'

import type { WorkspaceTeamMemberDocument } from 'fireux-core/runtime/workspace/models/team-member.model'
import { computed, watchEffect } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useWorkspaceTeam } from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
import { normalizeString } from 'fireux-core/runtime/utils/normalize-string'
import { kitchenTeamMemberLimit } from '../../utils/team.ts'
import { useKitchenWorkspace } from './useKitchenWorkspace'
import { useKitchenChildCollection } from '../useKitchenChildCollection'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
import { useKitchenMemberInvitationCreate } from '../team/useKitchenMemberInvitationCreate'

type KitchenTeamResponse = {
  ok: true
  kitchenId: string
  canManageTeam: boolean
  members: Array<{
    memberId: string
    name: string
    avatar: string
    userId: string
    linked: boolean
  }>
}

export function useKitchenWorkspaceTeam() {
  const appSession = useAppSession()
  const { currentUser, hasAuthState } = useAuth()
  const membership = appSession.appUser
  const fireux = useFireUXConfig()
  const workspace = useKitchenWorkspace()
  const selectedKitchen = workspace.data
  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const rootCollection = computed(() => 'kitchens')
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')

  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const liveTeam = useKitchenChildCollection<WorkspaceTeamMemberDocument>(
    'team',
    fetchKitchenId,
    {
      kitchenCollectionPath: rootCollection,
      databaseId,
    }
  )
  const projectionScope = computed(() => {
    const uid = currentUser.value?.uid
    if (
      !hasAuthState.value ||
      !uid ||
      !kitchenId.value ||
      liveTeam.pending.value ||
      liveTeam.error.value
    )
      return ''
    const accountLinks = liveTeam.items.value
      .filter((member) => member.user_id)
      .map((member) => [member.id, member.user_id])
    return JSON.stringify([uid, kitchenId.value, accountLinks])
  })
  const { data: teamRead, error: teamError } = useAsyncData(
    computed(() => `kitchen-team:${projectionScope.value}`),
    async (_nuxtApp, { signal }) => {
      const scope = projectionScope.value
      const user = currentUser.value
      const id = kitchenId.value
      if (!scope || !user) return { scope, response: null }
      const response = await $fetch<KitchenTeamResponse>(
        '/api/workspace/kitchen/team/members',
        {
          signal,
          cache: 'no-store',
          query: { kitchenId: id },
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
        }
      )
      if (!response.ok || response.kitchenId !== id)
        throw new Error(
          'Kitchen Team response did not match the selected Kitchen.'
        )
      return { scope, response }
    },
    { server: false }
  )
  // Nuxt can retain the previous key's data while it fetches the new key.
  const projection = computed(() =>
    teamRead.value?.scope === projectionScope.value &&
    teamRead.value?.response?.kitchenId === kitchenId.value
      ? teamRead.value.response
      : null
  )
  const canWrite = computed(() => projection.value?.canManageTeam === true)
  const projectedMembersById = computed(
    () =>
      new Map(
        (projection.value?.members || []).map((member) => [
          member.memberId,
          member,
        ])
      )
  )
  const teamMembers = computed<
    Array<WorkspaceTeamMemberDocument & { avatar: string }>
  >(() =>
    (pending.value || error.value || !projection.value
      ? []
      : liveTeam.items.value
    ).map((member) => {
      const projected = projectedMembersById.value.get(member.id)
      const account =
        member.user_id && projected?.userId === member.user_id
          ? projected
          : null
      return {
        ...member,
        name: member.user_id
          ? account?.name || 'Linked account unavailable'
          : member.name,
        avatar: account?.avatar || '',
      }
    })
  )
  const selectableTeamMembers = teamMembers
  const subscription = computed(() => membership.value?.subscription || 'free')
  const teamMemberLimit = computed(() =>
    kitchenTeamMemberLimit(fireux.subscriptionCapacity, subscription.value)
  )
  const pending = computed(
    () =>
      !hasAuthState.value ||
      (!workspace.data.value && workspace.outcome.value === 'pending') ||
      liveTeam.pending.value ||
      Boolean(projectionScope.value && !projection.value && !teamError.value)
  )
  const error = computed(
    () =>
      liveTeam.error.value ??
      teamError.value ??
      appSession.error.value ??
      (workspace.outcome.value === 'error'
        ? new Error('Kitchen workspace could not be read.')
        : undefined) ??
      undefined
  )
  const team = useWorkspaceTeam({
    canWrite,
    members: selectableTeamMembers,
    workspaceId: kitchenId,
    capabilityId: 'kitchen.team',
    pending,
    error,
    memberLimit: teamMemberLimit,
  })
  const pageState = useWorkspacePageState('kitchen')
  const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
  const members = computed<WorkspaceTeamMember[]>(() =>
    selectableTeamMembers.value.map((member) => ({
      id: member.id,
      userId: member.user_id || '',
      name: member.name || 'Unnamed team member',
      avatar: member.avatar,
      roleIds: member.role_ids,
    }))
  )

  const state = computed(() => ({
    kitchen: {
      id: normalizeString(selectedKitchen.value?.id),
      name: normalizeString(selectedKitchen.value?.presentation?.display_name),
    },
    team: {
      members: members.value,
      selectedTeamMemberId: team.selectedTeamMemberId.value,
    },
  }))
  const derived = team.derived

  async function createTeamMember(input: { name: string; userId?: string }) {
    input = { ...input }
    if (!team.canCreateTeamMember.value)
      throw new Error('Adding a person is not available.')
    const targetId = kitchenId.value
    if (!targetId)
      throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ ok: true; memberId: string; name: string }>(
      '/api/workspace/kitchen/team/members',
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
        timeout: 15000,
        retry: 0,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          kitchenId: targetId,
          name: input.name.trim(),
          userId: input.userId?.trim() || '',
        },
      }
    )
    if (result.ok !== true || !result.memberId)
      throw new Error('Add team member response was invalid.')
    if (targetId === kitchenId.value) team.selectCreated(result.memberId)
    return result
  }

  async function updateTeamMember(input: { memberId: string; name: string }) {
    const targetId = kitchenId.value
    input = { ...input }
    if (!targetId)
      throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const token = await user.getIdToken()
    if (user.uid !== currentUser.value?.uid)
      throw new Error('The signed-in account changed. Try again.')
    const result = await $fetch<{ ok: true; memberId: string; name: string }>(
      `/api/workspace/kitchen/team/members/${encodeURIComponent(input.memberId)}`,
      {
        onResponse: async ({ response }) => {
          if (response.ok) await refreshNuxtData()
        },
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          kitchenId: targetId,
          changes: { name: input.name.trim() },
        },
      }
    )
    if (result.ok !== true || result.memberId !== input.memberId)
      throw new Error('Update team member response was invalid.')
    return result
  }

  const captureRemoval = useCommandScope([
    currentUser,
    membership,
    kitchenId,
    canWrite,
  ])
  async function removeTeamMember(
    memberId: string,
    isSurfaceCurrent: () => boolean = () => true
  ) {
    const targetId = kitchenId.value
    if (!targetId)
      throw new Error('Select a record before changing Team members.')
    const user = currentUser.value
    if (!user || user.isAnonymous)
      throw new Error('Sign in before changing Team members.')
    const inScope = captureRemoval()
    const token = await user.getIdToken()
    if (
      !inScope() ||
      !isSurfaceCurrent() ||
      !canWrite.value ||
      !members.value.some((member) => member.id === memberId)
    )
      throw new Error(
        'The selected workspace or member changed. Review the removal again.'
      )
    const result = await $fetch<{ ok: true; memberId: string; name: string }>(
      `/api/workspace/kitchen/team/members/${encodeURIComponent(memberId)}`,
      {
        onResponse: async ({ response }) => {
          if (response.ok) await refreshNuxtData()
        },
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        query: { kitchenId: targetId },
      }
    )
    if (result?.ok !== true || result.memberId !== memberId)
      throw new Error('Remove team member response was invalid.')
    if (
      inScope() &&
      isSurfaceCurrent() &&
      team.selectedTeamMemberId.value === memberId
    )
      team.selectedTeamMemberId.value = ''
    return result
  }

  async function createTeamMemberInvitation(memberId: string) {
    return createKitchenMemberInvitation({
      kitchenId: kitchenId.value,
      memberId,
    })
  }

  const context = computed(() => ({
    workspace: { id: kitchenId.value },
    collection: { records: state.value.team.members },
    selected:
      state.value.team.members.find(
        (member: WorkspaceTeamMember) =>
          member.id === state.value.team.selectedTeamMemberId
      ) ?? null,
    derived: derived.value,
  }))
  watchEffect(() => pageState.publish(context.value))

  return {
    workspaceId: kitchenId,
    context,
    teamMembers,
    pending,
    state,
    derived,
    primitives: {
      create: createTeamMember,
      update: updateTeamMember,
      delete: removeTeamMember,
    },
    natives: {
      select: team.select,
      selectCreated: team.selectCreated,
      invite: createTeamMemberInvitation,
    },
  }
}
