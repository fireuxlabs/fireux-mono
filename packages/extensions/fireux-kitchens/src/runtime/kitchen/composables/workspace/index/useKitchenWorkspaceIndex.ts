import { computed, nextTick, onMounted, ref, watch, watchEffect } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/utils/workspace-policy'
import { useKitchenWorkspaceCurrent } from './useKitchenWorkspaceCurrent'

export type KitchenWorkspaceIndexState = {
  user: {
    id: string
    anonymous: boolean
    kitchens: string[]
    primaryKitchen: string
  }
  kitchen: {
    id: string
    placeId: string
    name: string
    tagline: string
    url: string
  }
}

export type KitchenWorkspaceIndexDerived = {
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasSelection: boolean
  canCreate: boolean
  canSelectMultiple: boolean
}

export function useKitchenWorkspaceIndex() {
  const { currentUser, hasAuthState } = useAuth()
  const appContext = useCurrentAppContext()
  const fireux = useFireUXConfig()
  const workspace = useWorkspace('kitchen')
  const pageState = useWorkspacePageState('kitchen')
  const mounted = ref(false)
  const primaryKitchenId = computed(
    () => appContext.membership.value?.primary_kitchen || ''
  )
  const current = useKitchenWorkspaceCurrent(primaryKitchenId)

  const state = computed<KitchenWorkspaceIndexState>(() => {
    const membership = appContext.membership.value
    const kitchen = current.kitchen.value
    const identity = kitchen?.identity
    return {
      user: {
        id: currentUser.value?.uid || '',
        anonymous: Boolean(currentUser.value?.isAnonymous),
        kitchens: membership?.kitchens || [],
        primaryKitchen: primaryKitchenId.value,
      },
      kitchen: {
        id: normalizeString(kitchen?.id),
        placeId: normalizeString(kitchen?.place_id),
        name: normalizeString(identity?.display_name),
        tagline: normalizeString(identity?.tagline),
        url: normalizeString(identity?.image_url),
      },
    }
  })

  const derived = computed<KitchenWorkspaceIndexDerived>(() => {
    const membership = appContext.membership.value
    const kitchens = membership?.kitchens || []
    const subscription = membership?.subscription || 'free'
    const canSelectMultiple =
      appSubscriptionCapacity(
        fireux.subscriptionCapacity,
        'kitchen',
        subscription
      ) === null
    let outcome: KitchenWorkspaceIndexDerived['outcome'] = 'idle'
    if (!mounted.value || !hasAuthState.value || appContext.pending.value)
      outcome = 'pending'
    else if (appContext.error.value || current.error.value) outcome = 'error'
    else if (!currentUser.value) outcome = 'idle'
    else if (!primaryKitchenId.value) outcome = 'empty'
    else if (current.pending.value) outcome = 'pending'
    else outcome = current.kitchen.value ? 'ready' : 'error'

    return {
      outcome,
      hasSelection: Boolean(current.kitchen.value),
      canSelectMultiple,
      canCreate:
        Boolean(membership) &&
        resolveWorkspaceCanCreate(
          fireux.role,
          fireux.workspaceConfig,
          'kitchen'
        ) &&
        hasAppSubscriptionCapacity(
          fireux.subscriptionCapacity,
          'kitchen',
          subscription,
          kitchens.length
        ),
    }
  })

  async function refresh() {
    await appContext.refresh()
    await nextTick()
    await current.refresh()
  }

  onMounted(() => {
    mounted.value = true
  })

  watchEffect(() => {
    pageState.publish({
      user: state.value.user,
      kitchen: state.value.kitchen,
      derived: derived.value,
    })
  })

  watch(
    () => [primaryKitchenId.value, state.value.kitchen] as const,
    ([primaryId, kitchen]: readonly [
      string,
      KitchenWorkspaceIndexState['kitchen'],
    ]) => {
      if (!primaryId || kitchen.id !== primaryId) {
        if (!primaryId) workspace.clearActive()
        return
      }
      workspace.activate(kitchen.id, kitchen.name, kitchen.tagline, kitchen.url)
      workspace.setActiveStatus(current.kitchen.value?.status || '')
    },
    { immediate: true }
  )

  watch(workspace.requestedId, async (kitchenId: string) => {
    if (!kitchenId) return
    const user = currentUser.value
    try {
      if (!user) return
      await $fetch('/api/workspace/kitchen/request-primary-change', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: { kitchenId },
      })
      await refresh()
    } finally {
      workspace.clearRequestedActivation()
    }
  })

  return { state, derived, actions: { refresh } }
}
