import { computed, onScopeDispose, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import type {
  KitchenWorkspaceCurrentResponse,
  KitchenWorkspaceKitchen,
} from '../../../models/kitchen-index.model.ts'
import {
  useKitchenInterface,
  type KitchenSurface,
} from '../../firestore/utils/view/useKitchenInterface'
import { readKitchenPresentationIdentity } from '../../../utils/kitchen-presentation'

export function useKitchenWorkspaceIndex() {
  const workspace = useWorkspace('kitchen')
  const { currentUser, hasAuthState } = useAuth()
  const { surface } = useKitchenInterface()
  const status = ref<'idle' | 'pending' | 'ready' | 'error'>('idle')
  const kitchenRecord = ref<KitchenWorkspaceKitchen | null>(null)
  let requestSequence = 0

  const kitchen = computed<KitchenSurface | null>(() =>
    kitchenRecord.value
      ? surface({ kitchen: kitchenRecord.value, routeScope: 'live' })
      : null
  )
  const id = computed(() => String(kitchenRecord.value?.id || '').trim())
  const presentation = computed(() =>
    readKitchenPresentationIdentity(kitchen.value)
  )
  const name = computed(() => presentation.value.displayName)
  const description = computed(() => presentation.value.tagline)
  const image = computed(
    () =>
      presentation.value.cardImageUrl ||
      presentation.value.imageUrl ||
      presentation.value.logoImageUrl
  )
  const outcome = computed<'idle' | 'pending' | 'error' | 'empty' | 'ready'>(
    () => {
      if (!hasAuthState.value || status.value === 'pending') return 'pending'
      if (!currentUser.value || status.value === 'idle') return 'idle'
      if (status.value === 'error') return 'error'
      return kitchenRecord.value ? 'ready' : 'empty'
    }
  )

  const setCurrent = (kitchenId: string) => {
    workspace.setCurrent(kitchenId)
  }

  const load = async (force = false) => {
    const user = currentUser.value
    if (!import.meta.client || !hasAuthState.value || !user) {
      status.value = 'idle'
      kitchenRecord.value = null
      return
    }

    const preferredId = workspace.currentId.value
    if (
      !force &&
      status.value === 'ready' &&
      String(kitchenRecord.value?.id || '').trim() === preferredId
    ) {
      return
    }

    const sequence = ++requestSequence
    status.value = 'pending'
    try {
      const token = await user.getIdToken()
      const response = await $fetch<KitchenWorkspaceCurrentResponse>(
        '/api/workspace/kitchen/current',
        {
          headers: { Authorization: `Bearer ${token}` },
          query: preferredId ? { kitchen_id: preferredId } : undefined,
        }
      )
      if (sequence !== requestSequence) return
      if (response.family !== 'kitchen') {
        throw new Error('Kitchen Workspace response scope mismatch.')
      }
      kitchenRecord.value = response.current
      status.value = 'ready'
      const currentId = String(response.current?.id || '').trim()
      if (currentId) {
        workspace.setCurrent(
          currentId,
          name.value,
          description.value,
          image.value
        )
      }
    } catch {
      if (sequence !== requestSequence) return
      kitchenRecord.value = null
      status.value = 'error'
    }
  }

  watch([hasAuthState, currentUser, workspace.currentId], () => void load(), {
    immediate: true,
  })
  onScopeDispose(() => {
    requestSequence += 1
  })

  return {
    current: computed(() => ({
      kitchen: kitchen.value,
      id: id.value,
      outcome: outcome.value,
    })),
    access: computed(() => ({
      canCreate: true,
      canWrite: kitchen.value?.can_write === true,
    })),
    actions: {
      setCurrent,
      refresh: () => load(true),
    },
  }
}
