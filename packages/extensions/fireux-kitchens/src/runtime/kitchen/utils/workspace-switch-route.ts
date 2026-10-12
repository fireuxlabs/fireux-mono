/** Return the nearest registered capability above a Kitchen-specific record. */
export function kitchenWorkspaceSwitchPath(
  matchedPaths: readonly string[],
  registeredPaths: readonly string[],
  homePath = '/workspace/kitchen'
): string | undefined {
  const prefixes = matchedPaths
    .filter((path) => path.startsWith('/workspace/kitchen/'))
    .map((path) => {
      const parameter = path.indexOf('/:')
      return parameter < 0 ? '' : path.slice(0, parameter)
    })
    .filter(Boolean)
    .sort((a, b) => a.length - b.length)
  let candidate = prefixes[0]
  if (!candidate) return
  while (candidate.startsWith('/workspace/kitchen')) {
    if (registeredPaths.includes(candidate)) return candidate
    candidate = candidate.slice(0, candidate.lastIndexOf('/'))
  }
  return homePath
}
