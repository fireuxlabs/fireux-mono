import type { ProjectDirectoryPage } from 'fireux-core/runtime/project/models/project-directory.model'

export function useProjectDirectory() {
  const request = useFetch<ProjectDirectoryPage>('/api/projects', {
    key: 'platform-project-directory',
    default: () => ({ projects: [] }),
  })
  const projects = computed(() => request.data.value?.projects ?? [])

  return {
    projects,
    count: computed(() => projects.value.length),
    pending: request.pending,
    error: request.error,
    refresh: request.refresh,
  }
}
