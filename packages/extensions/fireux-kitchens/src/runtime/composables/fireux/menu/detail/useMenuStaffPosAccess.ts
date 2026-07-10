import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { useAuthRedirect } from 'fireux-core/runtime/composables/fireux/app/ui/useAuthRedirect'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenFetch } from '../../firestore/kitchen/useKitchen'
import { resolveKitchenScopeCollectionPath } from '../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import type { MenuManifest } from '../../../../models/kitchen/menu/menu-detail.model'

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuStaffPosAccess(options: {
  enabled: MaybeRefOrGetter<boolean>
  menu: MaybeRefOrGetter<MenuManifest>
}) {
  const { uid } = useAuth()
  const menu = computed(() => toValue(options.menu))
  const appId = computed(() => text(menu.value.source.appId))
  const kitchenId = computed(() => text(menu.value.source.kitchenId))
  const collectionPath = computed(() =>
    appId.value ? resolveKitchenScopeCollectionPath(appId.value) : ''
  )
  const { kitchen, pending } = useKitchenFetch(kitchenId, {
    collectionPath,
    hydrate: false,
  })
  const auth = useAuthRedirect({ enabled: options.enabled })
  const canUseStaffPos = computed(() =>
    targetHasOperator(kitchen.value, text(uid.value))
  )
  const staffAccessPending = computed(() =>
    !auth.isReady.value ||
      (auth.isAuthenticated.value && pending.value)
  )

  return {
    canUseStaffPos,
    staffAccessPending,
  }
}
