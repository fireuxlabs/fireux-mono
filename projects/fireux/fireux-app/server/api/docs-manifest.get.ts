import { defineEventHandler } from 'h3'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, stat } from 'node:fs/promises'

type DocsEntry = {
  heading: string
  label: string
  path: string
  canonical: boolean
}

const headingPrefix = '### '
const itemPrefix = '- ['

function normalizeHeading(rawHeading: string): string {
  const trimmed = rawHeading.trim()
  const [title] = trimmed.split(' — ')
  return title.trim()
}

function parseEntry(line: string, heading: string): DocsEntry | null {
  const match = line.match(/^- \[(.+?)\]\((.+?)\)(.*)$/)
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

function parseManifest(raw: string): DocsEntry[] {
  const entries: DocsEntry[] = []
  let currentHeading: string | null = null

  for (const line of raw.split('\n')) {
    if (line.startsWith(headingPrefix)) {
      const heading = normalizeHeading(line.slice(headingPrefix.length))
      currentHeading = heading
      continue
    }

    if (!currentHeading) continue
    if (!line.startsWith(itemPrefix)) continue

    const entry = parseEntry(line, currentHeading)
    if (entry) entries.push(entry)
  }

  return entries
}

async function readDocsManifest(): Promise<DocsEntry[]> {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const manifestPath = resolve(currentDir, '../../docs/_manifest.md')

  const fileStat = await stat(manifestPath)
  if (!fileStat.isFile()) {
    throw new Error(`Documentation manifest is not a file: ${manifestPath}`)
  }

  const raw = await readFile(manifestPath, 'utf-8')
  return parseManifest(raw)
}

export default defineEventHandler(async () => {
  return readDocsManifest()
})
