import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { useRoute } from 'vue-router'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceAccess'
import { useAuthRedirect } from 'fireux-core/runtime/user/composables/useAuthRedirect'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenFetch } from '../../../kitchen/composables/firestore/useKitchen'
import { resolveKitchenScopeCollectionPath } from '../../../kitchen/composables/firestore/utils/paths/useKitchenChildCollection'
import type { MenuManifest } from '../../models/menu-detail.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

export function useMenuStaffPosAccess(options: {
  enabled: MaybeRefOrGetter<boolean>
  menu: MaybeRefOrGetter<MenuManifest>
}) {
  const route = useRoute()
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
  const auth = useAuthRedirect({
    enabled: options.enabled,
    unauthenticatedPath:
      `/auth?redirect=${encodeURIComponent(route.fullPath || '/')}`,
  })
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
