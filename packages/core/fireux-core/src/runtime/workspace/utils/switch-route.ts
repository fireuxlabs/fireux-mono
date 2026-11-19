/** Leave a record route for its nearest registered static capability. */
export function workspaceSwitchPath(
  matchedPaths: readonly string[],
  registeredPaths: readonly string[],
  workspacePath: string,
  homePath = workspacePath
): string | undefined {
  let parent: string | undefined
  for (const path of matchedPaths) {
    if (!path.startsWith(`${workspacePath}/`)) continue
    const parameter = path.indexOf('/:')
    if (parameter < 0) continue
    const prefix = path.slice(0, parameter)
    if (!parent || prefix.length < parent.length) parent = prefix
  }
  if (!parent) return
  while (parent.length >= workspacePath.length) {
    if (registeredPaths.includes(parent)) return parent
    parent = parent.slice(0, parent.lastIndexOf('/'))
  }
  return homePath
}
