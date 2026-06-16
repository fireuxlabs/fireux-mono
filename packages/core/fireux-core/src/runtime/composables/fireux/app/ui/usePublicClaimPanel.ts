import { computed, ref, type Ref } from 'vue'
import { useUserFetch } from '../../firestore/core/user/fetch/useUserFetch'
import { useUser } from '../../firestore/core/user/useUser'
import { useUserInterface } from '../../firestore/core/user/utils/view/useUserInterface'
import { useToastify } from './useToastify'
import { useConsoleEntryCta } from './nav/useConsoleEntryCta'

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
  const value = source && typeof source === 'object' && 'value' in source
    ? source.value
    : source

  return String(value ?? '').trim()
}

export function usePublicClaimPanel(options: ClaimPanelOptions) {
  const recordId = computed(() => readString(options.id))
  const claimedBy = computed(() => readString(options.claimedBy))
  const isClaimed = computed(() => Boolean(claimedBy.value))
  const editTo = computed(() => readString(options.editTo))

  const { user: claimedUser } = useUserFetch(claimedBy)
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

  const { consoleActions: consoleEntryActions } = useConsoleEntryCta()
  const consoleActions = computed(() => {
    if (!canEdit.value) return []

    return consoleEntryActions.value.map((entry) => ({
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
      const message = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`${options.failedToast || 'Failed to claim record'}: ${message}`)
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
    consoleActions,
    onClaim,
  }
}
