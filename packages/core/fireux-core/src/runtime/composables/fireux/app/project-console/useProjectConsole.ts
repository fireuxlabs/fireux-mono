import { computed } from 'vue'
import { useProjectCollection } from '../../firestore/core/project/fetch/useProjectCollection'
import { useProjectInterface } from '../../firestore/core/project/utils/view/useProjectInterface'
import { useProjectSelection } from './useProjectSelection'

type UseProjectConsoleOptions = {
  publishHeader?: boolean
}

export function useProjectConsole(_options: UseProjectConsoleOptions = {}) {
  const { selectedId, mode } = useProjectSelection()
  const { projects } = useProjectCollection()
  const { pill } = useProjectInterface()

  const entity = computed(
    () =>
      projects.value.find((project) => String(project?.id || '').trim() === selectedId.value) ??
      null
  )

  const project = computed(() => pill(entity.value))

  const projectState = {
    id: selectedId,
    entity,
    isDemo: computed(() => mode.value === 'demo'),
    scenario: computed(() => null),
  }

  return {
    project,
    projectState,
  }
}
