export function normalizeSeoPath(input: string): string | null {
  let path = input.trim()
  if (!path) return null
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname || '/'
    } catch {
      return null
    }
  }
  path = path.split(/[?#]/, 1)[0] || '/'
  if (!path.startsWith('/')) path = `/${path}`
  return path.replace(/\/+$/, '') || '/'
}

export function matchesSeoPath(input: string, rawPattern: string): boolean {
  const path = normalizeSeoPath(input)
  const pattern = rawPattern.trim()
  if (!path || !pattern) return false
  if (!pattern.includes('*') && !pattern.includes('?')) {
    const normalized = normalizeSeoPath(pattern)
    return Boolean(
      normalized && (path === normalized || path.startsWith(`${normalized}/`))
    )
  }
  let expression = '^'
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern.charAt(index)
    if (char === '*') {
      if (pattern[index + 1] === '*') {
        expression += '.*'
        index += 1
      } else expression += '[^/]*'
    } else if (char === '?') expression += '[^/]'
    else expression += char.replace(/[\\^$+?.()|[\]{}]/g, '\\$&')
  }
  return new RegExp(`${expression}$`).test(path)
}

export function resolveSeoRobots(input: {
  path: string
  enabled?: boolean
  noindexPaths?: readonly string[]
  robots?: string | null
}): string {
  if (
    input.enabled === false ||
    input.noindexPaths?.some((pattern) => matchesSeoPath(input.path, pattern))
  ) {
    return 'noindex, nofollow'
  }
  return input.robots?.trim() || 'index, follow'
}
