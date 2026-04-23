import { computed } from 'vue'
import { useKitchenConsole } from './useKitchenConsole'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useKitchenConsoleChildFocus() {
  const { selectedKitchen, selectedMode } = useKitchenConsole()

  const kitchenId = computed(() => normalizeString(selectedKitchen.value?.id))
  const selectedKitchenName = computed(
    () => normalizeString(selectedKitchen.value?.name)
  )
  const selectedModeLabel = computed(() =>
    selectedMode.value === 'demo' ? 'Demo' : selectedMode.value === 'test' ? 'Test' : 'Live'
  )

  return {
    selectedKitchen,
    selectedMode,
    selectedModeLabel,
    selectedKitchenName,
    kitchenId,
  }
}
