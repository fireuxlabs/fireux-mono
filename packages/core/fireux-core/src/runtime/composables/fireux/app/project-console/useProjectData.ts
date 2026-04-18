import { computed, type ComputedRef, type Ref } from 'vue'
import { useEcosystem } from '../../firestore/core/ecosystem/useEcosystem'
import { useProjectConsole } from './useProjectConsole'

type ProjectDataParams = {
  entity?: Ref<Record<string, unknown> | null> | ComputedRef<Record<string, unknown> | null>
}

export function useProjectData(params: ProjectDataParams = {}) {
  const { selectedProject } = useProjectConsole()
  const entity = params.entity ?? selectedProject
  const ecosystemId = computed(() => String(entity.value?.ecosystem_id || '').trim())
  const {
    ecosystem,
    pending: pendingEcosystem,
    profile: toEcosystemProfile,
  } = useEcosystem(ecosystemId)

  return computed(() => {
    const project = entity.value
    const resolvedEcosystem = ecosystem.value

    return {
      project,
      apps: [] as unknown[],
      ecosystemId: ecosystemId.value,
      ecosystem: resolvedEcosystem,
      ecosystemProfile: toEcosystemProfile(resolvedEcosystem),
      pendingEcosystem: pendingEcosystem.value,
    }
  })
}
