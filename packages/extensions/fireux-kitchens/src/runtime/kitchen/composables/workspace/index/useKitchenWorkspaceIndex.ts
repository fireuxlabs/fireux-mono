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
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/utils/workspace-policy'
import { useKitchenWorkspaceCurrent } from './useKitchenWorkspaceCurrent'
import { useKitchenUpdate } from '../../firestore/mutations/useKitchenUpdate'

export type KitchenWorkspaceIndexState = {
  user: {
    id: string
    anonymous: boolean
  }
  appUser: {
    kitchens: string[]
    primaryKitchen: string
  }
  kitchen: {
    id: string
    placeId: string
    slug: string
    status: 'active' | 'inactive' | 'archived'
    visibility: boolean
    name: string
    tagline: string
    url: string
  }
}

export type KitchenWorkspaceIndexDerived = {
  status: 'idle' | 'loading' | 'error' | 'empty' | 'ready'
  capability: ReturnType<typeof defineWorkspaceCapabilityContext>
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
  const { updateKitchen } = useKitchenUpdate()

  const state = computed<KitchenWorkspaceIndexState>(() => {
    const membership = appContext.membership.value
    const kitchen = current.kitchen.value
    const identity = kitchen?.identity
    return {
      user: {
        id: currentUser.value?.uid || '',
        anonymous: Boolean(currentUser.value?.isAnonymous),
      },
      appUser: {
        kitchens: membership?.kitchens || [],
        primaryKitchen: primaryKitchenId.value,
      },
      kitchen: {
        id: normalizeString(kitchen?.id),
        placeId: normalizeString(kitchen?.place_id),
        slug: normalizeString(kitchen?.slug),
        status: kitchen?.status || 'inactive',
        visibility: kitchen?.visibility === true,
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
    const limit = appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'kitchen',
      subscription
    )
    const count = kitchens.length
    let status: KitchenWorkspaceIndexDerived['status'] = 'idle'
    if (!mounted.value || !hasAuthState.value || appContext.pending.value)
      status = 'loading'
    else if (appContext.error.value || current.error.value) status = 'error'
    else if (!currentUser.value) status = 'idle'
    else if (!primaryKitchenId.value) status = 'empty'
    else if (current.pending.value) status = 'loading'
    else status = current.kitchen.value ? 'ready' : 'error'

    const createAllowed =
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
        count
      )
    return {
      status,
      capability: defineWorkspaceCapabilityContext({
        id: 'kitchen',
        subject: 'Kitchen',
        primitives: {
          create: { available: createAllowed, limit },
          read: { available: count > 0, count },
          update: { available: Boolean(state.value.kitchen.id) },
          delete: { available: false },
        },
        natives: [
          { id: 'adopt-existing-place', primitive: 'create' },
          { id: 'create-name-only-kitchen', primitive: 'create' },
        ],
      }),
    }
  })

  async function refresh() {
    await appContext.refresh()
    await nextTick()
    await current.refresh()
  }

  async function update(input: Parameters<typeof updateKitchen>[0]) {
    await updateKitchen(input)
    await refresh()
  }

  onMounted(() => {
    mounted.value = true
  })

  watchEffect(() => {
    pageState.publish({
      user: state.value.user,
      appUser: state.value.appUser,
      kitchen: state.value.kitchen,
      derived: derived.value,
    })
  })

  watch(
    () =>
      [
        derived.value.status,
        primaryKitchenId.value,
        state.value.kitchen,
      ] as const,
    ([outcome, primaryId, kitchen]: readonly [
      KitchenWorkspaceIndexDerived['status'],
      string,
      KitchenWorkspaceIndexState['kitchen'],
    ]) => {
      if (outcome === 'loading') return
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

  return { state, derived, primitives: { update }, natives: { refresh } }
}
