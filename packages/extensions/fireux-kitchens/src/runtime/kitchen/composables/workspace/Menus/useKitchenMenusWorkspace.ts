import { computed, inject, provide, watchEffect, type InjectionKey } from 'vue'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import { defineWorkspaceCapabilityContext } from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'
import { useKitchenWorkspaceMenus } from './useKitchenWorkspaceMenus'

export type KitchenMenusWorkspace = ReturnType<typeof useKitchenWorkspaceMenus>

const kitchenMenusWorkspaceKey: InjectionKey<KitchenMenusWorkspace> = Symbol(
  'KitchenMenusWorkspace'
)

export function provideKitchenMenusWorkspace() {
  const workspace = useKitchenWorkspaceMenus()
  const pageState = useWorkspacePageState('kitchen')
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
      capability: defineWorkspaceCapabilityContext({
        id: 'kitchen.menus',
        subject: 'Menu',
        primitives: {
          create: {
            available:
              workspace.canCreateMenu.value && !workspace.error.value,
            limit: null,
          },
          read: { available: count > 0, count },
          update: { available: Boolean(workspace.selectedMenu.value) },
          delete: { available: Boolean(workspace.selectedMenu.value) },
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

  provide(kitchenMenusWorkspaceKey, workspace)
  return workspace
}

export function useKitchenMenusWorkspace() {
  const workspace = inject(kitchenMenusWorkspaceKey)
  if (!workspace) {
    throw new Error('Kitchen Menus workspace is not available')
  }

  return workspace
}
