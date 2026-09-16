import {
  computed,
  inject,
  provide,
  ref,
  watchEffect,
  type InjectionKey,
} from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import { useKitchenWorkspaceMenus } from './useKitchenWorkspaceMenus'

export type KitchenMenusContext = ReturnType<
  typeof createKitchenMenusWorkspace
>

const kitchenMenusWorkspaceKey: InjectionKey<KitchenMenusContext> = Symbol(
  'KitchenMenusContext'
)

function createKitchenMenusWorkspace() {
  const workspace = useKitchenWorkspaceMenus()
  const pageState = useWorkspacePageState('kitchen')
  const createOpen = ref(false)
  const readOpen = ref(false)
  const state = computed(() => ({
    menus: workspace.menus.value.map((menu) => ({
      id: String(menu.id || '').trim(),
      name: String(menu.name || '').trim(),
      status: String(menu.status || '').trim(),
    })),
    selectedMenuId: workspace.selectedMenuId.value,
  }))
  const derived = computed(() => {
    const status = !workspace.kitchenId.value
      ? 'empty'
      : workspace.pending.value
        ? 'loading'
        : workspace.error.value
          ? 'error'
          : workspace.menus.value.length
            ? 'ready'
            : 'empty'
    const count = workspace.menus.value.length

    return {
      status: status as 'loading' | 'error' | 'empty' | 'ready',
      allowance: {
        subscription: workspace.subscription.value,
        configured: true,
        count: workspace.menuCount.value,
        limit: workspace.menuLimit.value,
        canCreate: workspace.canCreateMenu.value,
        reason: workspace.menuCreateBlockedMessage.value,
      },
      capability: defineWorkspaceCapabilityContext({
        id: 'kitchen.menus',
        subject: 'Menu',
        primitives: {
          create: {
            available: workspace.canCreateMenu.value && !workspace.error.value,
            limit: workspace.menuLimit.value,
          },
          read: { available: count > 0, count },
          update: {
            available:
              workspace.canWrite.value && Boolean(workspace.selectedMenu.value),
          },
          delete: {
            available:
              workspace.canWrite.value && Boolean(workspace.selectedMenu.value),
          },
        },
        natives: [],
      }),
    }
  })

  watchEffect(() => {
    pageState.publish({
      menus: state.value.menus,
      selectedMenuId: state.value.selectedMenuId,
      derived: derived.value,
    })
  })

  return {
    ...workspace,
    state,
    derived,
    primitiveModals: { createOpen, readOpen },
    actions: {
      openCreate: () => {
        if (derived.value.capability.primitives.create.available) {
          createOpen.value = true
        }
      },
      openRead: () => {
        if (derived.value.capability.primitives.read.available) {
          readOpen.value = true
        }
      },
    },
  }
}

export function provideKitchenMenusContext() {
  const workspace = createKitchenMenusWorkspace()
  provide(kitchenMenusWorkspaceKey, workspace)
  return workspace
}

export function useKitchenMenusContext() {
  const workspace = inject(kitchenMenusWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Menus workspace is not available')
  }

  return workspace
}

export function useKitchenMenusContextSource() {
  return inject(kitchenMenusWorkspaceKey, null) ?? useKitchenWorkspaceMenus()
}
