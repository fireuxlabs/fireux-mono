import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useAppUserRead } from 'fireux-core/runtime/app/composables/useAppUserRead'
import { useMembershipAccess } from 'fireux-core/runtime/app/composables/useMembershipAccess'
import { useAuthRedirect } from 'fireux-core/runtime/user/composables/useAuthRedirect'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { kitchenAccessCollectionPath } from '../../../kitchen/utils/kitchen-access'
import type { MenuManifest } from '../../models/menu-detail.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuStaffPosAccess(options: {
  enabled: MaybeRefOrGetter<boolean>
  menu: MaybeRefOrGetter<MenuManifest>
}) {
  const { uid } = useAuth()
  const menu = computed(() => toValue(options.menu))
  const appId = computed(() => text(menu.value.source.appId))
  const kitchenId = computed(() => text(menu.value.source.kitchenId))
  const membership = useAppUserRead(appId, uid)
  const access = useMembershipAccess(
    () => (appId.value ? kitchenAccessCollectionPath(appId.value) : ''),
    uid,
    membership.appUser
  )
  const auth = useAuthRedirect({
    enabled: options.enabled,
    unauthenticatedPath: '/auth',
  })
  const canUseStaffPos = computed(() =>
    Boolean(
      toValue(options.enabled) &&
        !membership.pending.value &&
        !membership.error.value &&
        access.outcome.value === 'ready' &&
        access.ids.value.includes(kitchenId.value)
    )
  )
  const staffAccessPending = computed(
    () =>
      !auth.isReady.value ||
      (auth.isAuthenticated.value &&
        (membership.pending.value || access.pending.value))
  )

  return {
    canUseStaffPos,
    staffAccessPending,
  }
}
