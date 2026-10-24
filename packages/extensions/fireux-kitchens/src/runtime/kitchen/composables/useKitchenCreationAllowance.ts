import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/workspace/utils/policy'
import { useKitchenAccess } from './useKitchenAccess'
import { resolveKitchenAllowance } from '../utils/kitchen-capacity'

/** Kitchen creation availability; the trusted create command owns enforcement. */
export function useKitchenCreationAllowance() {
  const access = useKitchenAccess()
  const session = useAppSession()
  const config = useFireUXConfig()
  const allowance = computed(() =>
    resolveKitchenAllowance(session.appUser.value, access.ids.value)
  )
  const ready = computed(
    () =>
      Boolean(session.uid.value) &&
      !session.pending.value &&
      !session.error.value &&
      !access.pending.value &&
      !access.error.value
  )
  const canAdd = computed(() => ready.value && allowance.value.canAdd)
  const creationEnabled = computed(() =>
    resolveWorkspaceCanCreate(config.role, config.workspaceConfig, 'kitchen')
  )
  const canCreate = computed(() => canAdd.value && creationEnabled.value)
  const showUpgrade = computed(
    () => creationEnabled.value && ready.value && allowance.value.showUpgrade
  )

  return {
    allowance,
    accountReady: ready,
    hasAccount: computed(() =>
      Boolean(session.uid.value && session.appUser.value)
    ),
    creationEnabled,
    canAdd,
    canCreate,
    showUpgrade,
  }
}
