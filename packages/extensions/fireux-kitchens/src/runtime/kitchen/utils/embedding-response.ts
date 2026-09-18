/** Add an enforcing policy without relaxing another CSP already on the response. */
export function embeddingResponseHeaders(
  headers: Record<string, string | number | string[] | undefined>,
  policy: string,
  inherited: string | number | string[] | undefined = undefined
) {
  const next = { ...headers }
  const existing: string[] = Array.isArray(inherited)
    ? [...inherited]
    : inherited
      ? [String(inherited)]
      : []
  for (const [key, value] of Object.entries(next)) {
    if (key.toLowerCase() === 'content-security-policy') {
      if (Array.isArray(value)) existing.push(...value)
      else if (value) existing.push(String(value))
      delete next[key]
    }
    if (key.toLowerCase() === 'cache-control') delete next[key]
  }
  next['content-security-policy'] = [...new Set([...existing, policy])].join(
    ', '
  )
  next['cache-control'] = 'private, no-store'
  return next
}

export function embeddingNeedsDocumentNavigation(input: {
  framed: boolean
  hydrating: boolean
  fromPath: string
  toPath: string
}) {
  return input.framed && !input.hydrating && input.fromPath !== input.toPath
}
