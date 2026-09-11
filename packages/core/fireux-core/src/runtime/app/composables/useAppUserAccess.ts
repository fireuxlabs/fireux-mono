// Concurrent edit — 2026-07-22 15:11 CEST — User access badge pass: derive one highest current-App tier without duplicating stored authority.
import { computed } from '#imports'
import { resolveAppUserAccess } from '../utils/app-user-access'
import type {
  AppUserSubscription,
  AppUserWithId,
} from '../models/app-user.model.ts'
import type { Ref } from 'vue'

export function useAppUserAccess(user: {
  appUser: Ref<AppUserWithId | null | undefined>
  appOutcome: Ref<'idle' | 'pending' | 'ready' | 'missing' | 'error'>
}) {
  const appAccess = computed(() =>
    resolveAppUserAccess(
      user.appOutcome.value === 'ready' ? user.appUser.value : null
    )
  )
  const appAccessOutcome = user.appOutcome
  const isAdmin = computed(() => appAccess.value.hasAdminAuthority)
  const isDeveloper = computed(() => appAccess.value.hasDeveloperAuthority)
  const subscription = computed<AppUserSubscription>(
    () => appAccess.value.subscription
  )
  const hasPremiumSubscription = computed(
    () => appAccess.value.hasPremiumSubscription
  )
  const hasBusinessSubscription = computed(
    () => appAccess.value.hasBusinessSubscription
  )
  const canOwnMultipleWorkspaces = hasBusinessSubscription

  return {
    appAccess,
    appAccessOutcome,
    isAdmin,
    isDeveloper,
    subscription,
    hasPremiumSubscription,
    hasBusinessSubscription,
    canOwnMultipleWorkspaces,
  }
}
