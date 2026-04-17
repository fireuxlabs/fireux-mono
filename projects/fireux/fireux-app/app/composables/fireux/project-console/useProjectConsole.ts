type ProjectConsoleMode = 'live' | 'demo'

export function useProjectConsole() {
  const projects = {
    live: 'hello world',
    demo: 'hello world',
    test: 'hello world',
  }
  const selectedProject: unknown = null

  const clearSelectedProject = () => undefined
  const selectProject = (
    _projectId: string,
    _mode?: ProjectConsoleMode
  ) => undefined

  return {
    projects,
    selectedProject,
    clearSelectedProject,
    selectProject,
  }
}
