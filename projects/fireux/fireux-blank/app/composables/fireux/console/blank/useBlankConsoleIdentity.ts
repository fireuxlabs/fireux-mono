import { computed } from 'vue'
import { useBlankConsole } from './useBlankConsole'
import { useBlankConsoleTargets } from './useBlankConsoleTargets'

export function useBlankConsoleIdentity() {
  const blank = useBlankConsole()
  const { selectedId } = useBlankConsoleTargets()
  const selectedBlank = computed(
    () =>
      blank.liveTargets.value.find((target) => target.id === selectedId.value) ??
      blank.demoTargets.value.find((target) => target.id === selectedId.value) ??
      null
  )

  return {
    selectedId,
    selectedBlank,
  }
}
