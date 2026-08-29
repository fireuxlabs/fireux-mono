import {
  computed,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import type {
  KitchenWorkspaceKitchen,
  KitchenWorkspaceKitchensResponse,
} from '../../../models/kitchen-index.model.ts'
import type { KitchenSurface } from '../../firestore/utils/view/useKitchenInterface'
import { useKitchenInterface } from '../../firestore/utils/view/useKitchenInterface'

export type UseKitchenWorkspaceKitchensResult = {
  kitchens: ComputedRef<KitchenSurface[]>
  primaryKitchenId: ComputedRef<string>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<WorkspaceTargetOutcome>
  refresh: () => Promise<void>
}

export function useKitchenWorkspaceKitchens(
  options: { enabled?: MaybeRefOrGetter<boolean> } = {}
): UseKitchenWorkspaceKitchensResult {
  const { currentUser, hasAuthState } = useAuth()
  const records = ref<KitchenWorkspaceKitchen[]>([])
  const primaryKitchenId = ref('')
  const status = ref<'idle' | 'pending' | 'ready' | 'error'>('idle')
  const requestError = ref<unknown>()
  let requestSequence = 0
  const { surface } = useKitchenInterface()
  const enabled = computed(
    () => options.enabled === undefined || Boolean(toValue(options.enabled))
  )
  const load = async () => {
    const user = currentUser.value
    if (!import.meta.client || !enabled.value || !hasAuthState.value || !user) {
      records.value = []
      primaryKitchenId.value = ''
      status.value = 'idle'
      return
    }
    const sequence = ++requestSequence
    status.value = 'pending'
    requestError.value = undefined
    try {
      const token = await user.getIdToken()
      const response = await $fetch<KitchenWorkspaceKitchensResponse>(
        '/api/workspace/kitchen/targets',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (sequence !== requestSequence) return
      records.value = response.items
      primaryKitchenId.value = response.primary_kitchen_id
      status.value = 'ready'
    } catch (error) {
      if (sequence !== requestSequence) return
      records.value = []
      primaryKitchenId.value = ''
      requestError.value = error
      status.value = 'error'
    }
  }
  watch([enabled, hasAuthState, currentUser], () => void load(), {
    immediate: true,
  })
  const kitchens = computed<KitchenSurface[]>(() =>
    records.value.flatMap((target) => {
      const kitchen = surface({ kitchen: target, routeScope: 'live' })
      return kitchen ? [kitchen] : []
    })
  )

  return {
    kitchens,
    primaryKitchenId: computed(() => primaryKitchenId.value),
    count: computed(() => kitchens.value.length),
    pending: computed(() => status.value === 'pending'),
    error: requestError,
    outcome: computed(() => {
      if (status.value === 'pending') return 'pending'
      if (status.value === 'error') return 'error'
      if (status.value === 'idle') return 'idle'
      return kitchens.value.length ? 'ready' : 'empty'
    }),
    refresh: load,
  }
}
