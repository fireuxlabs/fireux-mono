import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppUserRead } from 'fireux-core/runtime/app/composables/membership/useAppUserRead'
import { useMembershipAccess } from 'fireux-core/runtime/app/composables/membership/useMembershipAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  KITCHEN_ACCESS_COLLECTION_PATH,
  readKitchenAppAccess,
} from '../utils/kitchen-access'
import { KITCHEN_USER_LIMIT } from '../utils/kitchen-capacity'

/** Kitchen associations are live and belong to this App membership lifetime. */
export function useKitchenAccess() {
  const { uid, hasAuthState } = useAuth()
  const { appId } = useFireUXConfig()
  const appUser = useAppUserRead(appId, uid)
  const membershipPending = computed(
    () => !hasAuthState.value || (Boolean(uid.value) && appUser.pending.value)
  )
  const membership = computed(() =>
    membershipPending.value || appUser.error.value
      ? null
      : appUser.appUser.value
  )
  const source = useMembershipAccess(
    KITCHEN_ACCESS_COLLECTION_PATH,
    uid,
    membership,
    (value) => readKitchenAppAccess(value, appId)
  )
  const error = computed(
    () =>
      appUser.error.value ||
      source.error.value ||
      (source.ids.value.length > KITCHEN_USER_LIMIT
        ? new Error('User Kitchens exceed the supported limit.')
        : undefined)
  )
  const pending = computed(
    () => membershipPending.value || source.pending.value
  )
  return {
    ids: computed(() => (pending.value || error.value ? [] : source.ids.value)),
    pending,
    error,
    outcome: computed(() => {
      if (error.value) return 'error' as const
      if (pending.value) return 'pending' as const
      return source.outcome.value
    }),
  }
}
