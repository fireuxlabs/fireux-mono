/** Project owns its App-scoped association storage. */
export function projectAccessCollectionPath(appId: string) {
  const id = appId.trim()
  if (!id || id.includes('/'))
    throw new Error('A valid App id is required for Project access.')
  return `project_access/${id}/users`
}
