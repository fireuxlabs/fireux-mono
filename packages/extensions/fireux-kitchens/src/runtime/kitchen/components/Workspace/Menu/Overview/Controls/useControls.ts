import { computed } from 'vue'
import { useKitchenWorkspaceMenuOverview } from '../../../../../composables/workspace/menu/overview'

export function useKitchenWorkspaceMenuOverviewControls() {
  const {
    menusOutcome,
    query,
    status,
    statusOptions,
    visibleMenus,
    canCreateMenu,
    createBlockedMessage,
    openCreate,
  } = useKitchenWorkspaceMenuOverview()
  const ready = computed(() => ['ready', 'empty'].includes(menusOutcome.value))
  const count = computed(() => visibleMenus.value.length)
  const createDisabled = computed(() => !ready.value || !canCreateMenu.value)
  return {
    ready,
    query,
    status,
    statusOptions,
    count,
    createDisabled,
    createBlockedMessage,
    openCreate,
  }
}
