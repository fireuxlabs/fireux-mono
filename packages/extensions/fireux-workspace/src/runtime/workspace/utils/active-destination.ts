type CurrentLocation = {
  path: string
  hash?: string
  query: Record<string, unknown>
}

/** Prefer the deepest registered destination while retaining record-detail matches. */
export function workspaceActiveDestination(
  destinations: readonly string[],
  current: CurrentLocation
): string | undefined {
  let selected: string | undefined
  let selectedDepth = -1
  let selectedSpecificity = -1
  for (const destination of destinations) {
    const target = new URL(destination, 'http://workspace.local')
    if (
      target.pathname !== current.path &&
      !current.path.startsWith(`${target.pathname}/`)
    )
      continue
    if (target.hash && target.hash !== current.hash) continue
    const query = [...target.searchParams]
    if (!query.every(([key, value]) => current.query[key] === value)) continue
    const depth = target.pathname.length
    const specificity = query.length + (target.hash ? 1 : 0)
    if (
      depth > selectedDepth ||
      (depth === selectedDepth && specificity > selectedSpecificity)
    ) {
      selected = destination
      selectedDepth = depth
      selectedSpecificity = specificity
    }
  }
  return selected
}
