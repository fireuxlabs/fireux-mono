import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useMembershipAccess } from 'fireux-core/runtime/app/composables/useMembershipAccess'
import { kitchenAccessCollectionPath } from '../utils/kitchen-access'
import { KITCHEN_USER_LIMIT } from '../utils/kitchen-capacity'

/** Kitchen associations are live and belong to this App membership lifetime. */
export function useKitchenAccess() {
  const session = useAppSession()
  const { appId } = useFireUXConfig()
  const membership = computed(() =>
    session.pending.value || session.error.value ? null : session.appUser.value
  )
  const source = useMembershipAccess(
    kitchenAccessCollectionPath(appId),
    session.uid,
    membership
  )
  const error = computed(
    () =>
      session.error.value ||
      source.error.value ||
      (source.ids.value.length > KITCHEN_USER_LIMIT
        ? new Error('User Kitchens exceed the supported limit.')
        : undefined)
  )
  const pending = computed(() => session.pending.value || source.pending.value)
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
