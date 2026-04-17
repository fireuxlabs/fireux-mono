import { useProjectConsole } from './useProjectConsole'

export function useActiveProject() {
  const { projectState } = useProjectConsole()

  return {
    id: projectState.id,
    entity: projectState.entity,
    isDemo: projectState.isDemo,
    scenario: projectState.scenario,
  }
}
