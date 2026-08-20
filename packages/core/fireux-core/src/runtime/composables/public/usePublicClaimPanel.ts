// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: hydrate claimant cards through the public identity API.
import { computed, ref, type Ref } from 'vue'
import { useUser } from '../../user/composables/useUser'
import { useUserInterface } from '../../user/composables/useUserInterface'
import { usePublicUserIdentity } from '../../user/composables/usePublicUserIdentity'
import { useToastify } from '../ui/useToastify'
import { useWorkspaceEntryCta } from '../fireux/workspace/useWorkspaceEntryCta'

type StringSource = string | null | undefined | Ref<string | null | undefined>

type ClaimPanelOptions = {
  id: StringSource
  claimedBy: StringSource
  editTo: StringSource
  claim: (id: string) => Promise<unknown>
  claimedToast?: string
  failedToast?: string
}

function readString(source: StringSource) {
  const value =
    source && typeof source === 'object' && 'value' in source
      ? source.value
      : source

  return String(value ?? '').trim()
}

export function usePublicClaimPanel(options: ClaimPanelOptions) {
  const recordId = computed(() => readString(options.id))
  const claimedBy = computed(() => readString(options.claimedBy))
  const isClaimed = computed(() => Boolean(claimedBy.value))
  const editTo = computed(() => readString(options.editTo))

  const { user: claimedUser } = usePublicUserIdentity(claimedBy)
  const { pill } = useUserInterface(claimedUser)
  const claimedUserPill = computed(() => pill(claimedUser.value))

  const { currentUser, isAdmin } = useUser()
  const isVerifiedUser = computed(() =>
    Boolean((currentUser.value as any)?.verified || isAdmin.value)
  )
  const canClaim = computed(() => !isClaimed.value && isVerifiedUser.value)
  const canEdit = computed(() =>
    Boolean(
      isAdmin.value ||
        (claimedBy.value && currentUser.value?.id === claimedBy.value)
    )
  )
  const isAdminEdit = computed(() =>
    Boolean(
      isAdmin.value &&
        (!claimedBy.value || currentUser.value?.id !== claimedBy.value)
    )
  )

  const { workspaceActions: workspaceEntryActions } = useWorkspaceEntryCta()
  const workspaceActions = computed(() => {
    if (!canEdit.value) return []

    return workspaceEntryActions.value.map((entry) => ({
      label: entry.label,
      to: entry.path,
      icon: entry.icon,
    }))
  })

  const toast = useToastify()
  const isClaiming = ref(false)

  async function onClaim() {
    if (isClaiming.value || !recordId.value || !canClaim.value) return

    isClaiming.value = true
    try {
      await options.claim(recordId.value)
      toast.success(options.claimedToast || 'Record claimed')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Please try again.'
      toast.error(
        `${options.failedToast || 'Failed to claim record'}: ${message}`
      )
    } finally {
      isClaiming.value = false
    }
  }

  return {
    claimedUserPill,
    isClaimed,
    canClaim,
    canEdit,
    isAdminEdit,
    editTo,
    isClaiming,
    workspaceActions,
    onClaim,
  }
}
