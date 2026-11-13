import { computed, ref, unref, type MaybeRef } from 'vue'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import type { AppUserSummary } from '../types.ts'
import type { AppUserSubscription } from '../models/model.ts'
import { useToastify } from '../../../composables/ui/useToastify'
import { useAppUserRead } from './useAppUserRead'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { runAppUserCommand } from './run-app-user-command'
import { useUserSession } from '../../../user/composables/session/useUserSession'

export type AppUserMembershipRecord = Pick<
  AppUserSummary,
  'id' | 'role' | 'subscription'
>

type AppUserMembershipOptions = {
  subjectUserId: MaybeRef<string | null | undefined>
  displayName?: MaybeRef<string | null | undefined>
}

/** Resolve and administer one User's bounded current-App membership. */
export function useAppUserMembership(options: AppUserMembershipOptions) {
  const subjectUserId = computed(() =>
    String(unref(options.subjectUserId) || '').trim()
  )
  const displayName = computed(() =>
    String(unref(options.displayName) || 'User').trim()
  )
  const {
    user: sessionUser,
    appUser: viewerAppUser,
    appUserOutcome,
    subscription: viewerSubscription,
    isAdmin,
    isDeveloper,
  } = useUserSession()
  const isOwnProfile = computed(() =>
    Boolean(
      subjectUserId.value && sessionUser.value?.id === subjectUserId.value
    )
  )
  const canManage = computed(() => isAdmin.value || isDeveloper.value)
  const canInspect = computed(() => isOwnProfile.value || canManage.value)
  const adminReadEnabled = computed(
    () => canManage.value && !isOwnProfile.value
  )
  const { appId } = useFireUXConfig()
  const { appUser: subjectMembership, outcome: adminOutcome } = useAppUserRead(
    appId,
    computed(() => (adminReadEnabled.value ? subjectUserId.value : ''))
  )
  const toast = useToastify()
  const subscriptionActionPending = ref(false)

  const membership = computed<AppUserMembershipRecord | null>(() => {
    if (!subjectUserId.value) return null
    if (isOwnProfile.value) {
      const value = viewerAppUser.value
      return value
        ? {
            id: subjectUserId.value,
            role: value.role,
            subscription: value.subscription,
          }
        : null
    }

    const value = subjectMembership.value
    return value
      ? {
          id: subjectUserId.value,
          role: value.role,
          subscription: value.subscription,
        }
      : null
  })
  const resolved = computed(() => {
    if (!canInspect.value) return false
    if (membership.value) return true
    if (isOwnProfile.value) return appUserOutcome.value === 'empty'
    return adminOutcome.value === 'empty'
  })
  const visible = computed(() => canInspect.value && resolved.value)

  const captureFeedback = useCommandScope([
    subjectUserId,
    sessionUser,
    viewerAppUser,
    () => viewerAppUser.value?.role,
    canManage,
    displayName,
  ])

  async function setSubscription(subscription: AppUserSubscription) {
    const value = membership.value
    if (
      !canManage.value ||
      !value ||
      value.subscription === subscription ||
      subscriptionActionPending.value
    ) {
      return
    }

    const isCurrent = captureFeedback()
    const subjectName = displayName.value || 'User'
    subscriptionActionPending.value = true
    try {
      await runAppUserCommand({
        action: 'set-subscription',
        userId: value.id,
        subscription,
      })
      if (isCurrent()) toast.success(`${subjectName} is now ${subscription}.`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Please try again.'
      if (isCurrent()) toast.error(`Subscription update failed: ${message}`)
    } finally {
      subscriptionActionPending.value = false
    }
  }

  return {
    membership,
    visible,
    resolved,
    isOwnProfile,
    canManage,
    viewerSubscription,
    subscriptionActionPending,
    setSubscription,
  }
}
