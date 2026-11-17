import {
  computed,
  inject,
  provide,
  ref,
  watchEffect,
  type InjectionKey,
} from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/workspace/composables/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/workspace/models/capability-context'
import { useKitchenWorkspaceMenus } from './useKitchenWorkspaceMenus'
import { kitchenMenusWorkspaceKey } from './kitchen-menus-workspace-state'

export type KitchenMenus = ReturnType<typeof createKitchenMenus>

const kitchenMenusKey: InjectionKey<KitchenMenus> = Symbol('KitchenMenus')

export function createKitchenMenus(publishPage = true) {
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
      : workspace.outcome.value === 'error'
        ? 'error'
        : workspace.outcome.value === 'pending'
          ? 'loading'
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
    if (!publishPage) return
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
    dialogs: { createOpen, readOpen },
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

export function provideKitchenMenus(publishPage = true) {
  const workspace = createKitchenMenus(publishPage)
  provide(kitchenMenusKey, workspace)
  return workspace
}

export function useKitchenMenus() {
  const workspace = useOptionalKitchenMenus()
  if (!workspace) {
    throw new Error('Kitchen Menus workspace is not available')
  }

  return workspace
}

/** Optional lookup never creates readers, commands or page publishers. */
export function useOptionalKitchenMenus() {
  return (
    inject(kitchenMenusKey, null) ??
    inject(kitchenMenusWorkspaceKey, null)?.menus ??
    null
  )
}
