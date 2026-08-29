// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: identify authoritative Project targets.
import { computed } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { useProjectWorkspace } from '../core/useProjectWorkspace'

export type ProjectWorkspaceIndexState = {
  project: { id: string; name: string; tagline: string; url: string }
  projects: { id: string; name: string; tagline: string; url: string }[]
}

export type ProjectWorkspaceIndexDerived = {
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasSelection: boolean
  canCreate: boolean
}

export function useProjectWorkspaceIndex() {
  const workspace = useProjectWorkspace()
  const state = computed<ProjectWorkspaceIndexState>(() => {
    const selectedProject = workspace.selection.project.value
    return {
      project: {
        id: normalizeString(selectedProject?.id),
        name: normalizeString(selectedProject?.name),
        tagline: normalizeString(selectedProject?.description),
        url: normalizeString(selectedProject?.image_url),
      },
      projects: workspace.targets.projects.value.map((project) => ({
        id: normalizeString(project.id),
        name: normalizeString(project.name),
        tagline: normalizeString(project.description),
        url: normalizeString(project.image_url),
      })),
    }
  })

  const derived = computed<ProjectWorkspaceIndexDerived>(() => ({
    outcome: workspace.targets.outcome.value,
    hasSelection: workspace.selection.hasSelection.value,
    canCreate: workspace.targets.outcome.value === 'empty',
  }))

  return { state, derived }
}
