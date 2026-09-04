import { computed, watchEffect } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/utils/workspace-policy'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'

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
  const appSession = useAppSession()
  const fireux = useFireUXConfig()
  const workspace = useKitchenWorkspace()
  const pageState = useWorkspacePageState('kitchen')

  const state = computed<KitchenWorkspaceIndexState>(() => {
    const membership = appSession.appUser.value
    const kitchen = workspace.data.value
    const identity = kitchen?.identity
    return {
      user: {
        id: appSession.uid.value,
        anonymous: false,
      },
      appUser: {
        kitchens: membership?.kitchens || [],
        primaryKitchen: workspace.selectedId.value,
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
    const membership = appSession.appUser.value
    const kitchens = membership?.kitchens || []
    const subscription = membership?.subscription || 'free'
    const limit = appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'kitchen',
      subscription
    )
    const count = kitchens.length
    let status: KitchenWorkspaceIndexDerived['status'] = 'idle'
    if (appSession.pending.value || workspace.outcome.value === 'pending')
      status = 'loading'
    else if (appSession.error.value || workspace.outcome.value === 'error')
      status = 'error'
    else if (!appSession.uid.value) status = 'idle'
    else if (!workspace.selectedId.value) status = 'empty'
    else status = workspace.data.value ? 'ready' : 'error'

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

  async function update(input: {
    kitchenId: string
    changes: Parameters<typeof workspace.update>[0]
  }) {
    if (input.kitchenId !== workspace.selectedId.value) {
      throw new Error('Kitchen update did not target the selected Workspace.')
    }
    await workspace.update(input.changes)
  }

  watchEffect(() => {
    pageState.publish({
      user: state.value.user,
      appUser: state.value.appUser,
      kitchen: state.value.kitchen,
      derived: derived.value,
    })
  })

  return { state, derived, primitives: { update }, natives: {} }
}
