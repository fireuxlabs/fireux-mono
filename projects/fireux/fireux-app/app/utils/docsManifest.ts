export type DocsEntry = {
  heading: string
  label: string
  path: string
  canonical: boolean
}

const headingPrefix = '### '
const itemPrefix = '- ['

export function normalizeHeading(rawHeading: string): string {
  const trimmed = rawHeading.trim()
  const [title] = trimmed.split(' — ')
  return title.trim()
}

export function parseEntry(line: string, heading: string): DocsEntry | null {
  const match = line.match(/^\- \[(.+?)\]\((.+?)\)(.*)$/)
  if (!match) {
    return null
  }

  const [, label, linkTarget, suffix] = match
  const canonical = suffix.includes('✅')

  return {
    heading,
    label,
    path: linkTarget,
    canonical,
  }
}

export function parseManifest(raw: string): DocsEntry[] {
  const entries: DocsEntry[] = []
  let currentHeading: string | null = null

  for (const line of raw.split('\n')) {
    if (line.startsWith(headingPrefix)) {
      const heading = normalizeHeading(line.slice(headingPrefix.length))
      currentHeading = heading
      continue
    }

    if (!currentHeading) {
      continue
    }

    if (!line.startsWith(itemPrefix)) {
      continue
    }

    const entry = parseEntry(line, currentHeading)
    if (entry) {
      entries.push(entry)
    }
  }

  return entries
}

export type DocsManifestGroup = {
  heading: string
  entries: DocsEntry[]
}

export function groupManifestEntries(
  entries: DocsEntry[]
): DocsManifestGroup[] {
  const order: string[] = []
  const grouped = new Map<string, DocsEntry[]>()

  for (const entry of entries) {
    if (!grouped.has(entry.heading)) {
      grouped.set(entry.heading, [])
      order.push(entry.heading)
    }
    grouped.get(entry.heading)!.push(entry)
  }

  return order.map((heading) => ({
    heading,
    entries: grouped.get(heading) ?? [],
  }))
}
