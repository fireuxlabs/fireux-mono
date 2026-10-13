import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenAccess } from '../../useKitchenAccess'
import {
  kitchenOrderIntakeFromRoot,
  readKitchenOrderIntake,
} from '../../../utils/order-intake'
import type { KitchenOrderIntake } from '../../../models/order-intake.model'

export function useKitchenOrderIntake() {
  const workspace = useKitchenWorkspace()
  const config = useFireUXConfig()
  const { currentUser } = useAuth()
  const { appUser } = useUserSession()
  const access = useKitchenAccess()
  const pending = ref(false),
    error = ref('')
  const policy = computed(() => {
    if (workspace.outcome.value !== 'ready') return null
    try {
      return kitchenOrderIntakeFromRoot(workspace.data.value)
    } catch {
      return null
    }
  })
  const canWrite = computed(
    () =>
      workspace.outcome.value === 'ready' &&
      workspace.accountReady.value &&
      workspace.hasAccount.value &&
      access.ids.value.includes(workspace.id.value) &&
      Boolean(policy.value)
  )
  const sources = [
    () => config.appId,
    workspace.id,
    workspace.outcome,
    workspace.accountReady,
    workspace.hasAccount,
    currentUser,
    () => JSON.stringify(appUser.value),
    access.outcome,
    () => JSON.stringify(access.ids.value),
  ]
  const capture = useCommandScope(sources)
  watch(
    sources,
    () => {
      pending.value = false
      error.value = ''
    },
    { flush: 'sync' }
  )
  async function save(changes: Partial<KitchenOrderIntake>) {
    if (!canWrite.value || pending.value || !policy.value) return
    const expected = readKitchenOrderIntake(policy.value)
    const intake = readKitchenOrderIntake({ ...expected, ...changes })
    const kitchenId = workspace.id.value,
      actor = currentUser.value,
      current = capture()
    pending.value = true
    error.value = ''
    try {
      const token = await actor?.getIdToken()
      if (!current() || !canWrite.value || !token)
        throw new Error('The Kitchen or account changed. Try again.')
      const result = await $fetch<{
        ok: true
        kitchenId: string
        intake: KitchenOrderIntake
      }>('/api/workspace/kitchen/ordering/intake', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: { kitchenId, intake, expected },
        retry: 0,
      })
      if (
        result?.ok !== true ||
        result.kitchenId !== kitchenId ||
        JSON.stringify(readKitchenOrderIntake(result.intake)) !==
          JSON.stringify(intake)
      )
        throw new Error('Order intake response did not match this Kitchen.')
    } catch (cause) {
      if (current()) {
        const source = cause as {
          data?: { statusMessage?: string }
          message?: string
        }
        error.value =
          source.data?.statusMessage ||
          source.message ||
          'Order intake could not be saved.'
      }
    } finally {
      if (current()) pending.value = false
    }
  }
  return { policy, canWrite, pending, error, save }
}
