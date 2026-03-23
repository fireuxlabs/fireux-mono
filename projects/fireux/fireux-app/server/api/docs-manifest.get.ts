import { defineEventHandler } from 'h3'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, readdir, stat } from 'node:fs/promises'

type DocsEntry = {
  heading: string
  label: string
  path: string
  canonical: boolean
}

const docsReadmeName = 'README.md'

function firstHeading(raw: string): string | null {
  for (const line of raw.split('\n')) {
    if (line.startsWith('# ')) return line.slice(2).trim()
  }
  return null
}

function toPosixPath(value: string): string {
  return value.split(sep).join('/')
}

function toDocsPath(relativeReadmePath: string): string {
  const normalized = toPosixPath(relativeReadmePath)
  const withoutReadme =
    normalized === docsReadmeName
      ? ''
      : normalized.replace(/\/README\.md$/, '')
  return withoutReadme ? `/${withoutReadme}` : '/'
}

function headingForPath(path: string): string {
  if (path === '/') return 'Package Root'
  if (path === '/src') return 'Source'
  if (path.startsWith('/src/runtime')) return 'Runtime'
  if (path.startsWith('/src/config')) return 'Config'
  if (path.startsWith('/src/types')) return 'Types'
  return 'Other'
}

function fallbackLabel(relativeReadmePath: string): string {
  const normalized = toPosixPath(relativeReadmePath)
  if (normalized === docsReadmeName) return 'FireUX Package Spine'

  const segments = normalized.split('/')
  const parent = segments.at(-2)
  return parent || 'README'
}

async function walkReadmes(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const out: string[] = []

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.output') {
      continue
    }

    const fullPath = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await walkReadmes(fullPath)))
      continue
    }

    if (entry.isFile() && entry.name === docsReadmeName) {
      out.push(fullPath)
    }
  }

  return out
}

async function readDocsManifest(): Promise<DocsEntry[]> {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const docsRoot = resolve(currentDir, '../../../../../packages/core/fireux-docs')

  const docsStat = await stat(docsRoot)
  if (!docsStat.isDirectory()) {
    throw new Error(`FireUX docs root is not a directory: ${docsRoot}`)
  }

  const readmes = await walkReadmes(docsRoot)
  const entries = await Promise.all(
    readmes.map(async (readmePath) => {
      const relativeReadmePath = relative(docsRoot, readmePath)
      const raw = await readFile(readmePath, 'utf-8')
      const path = toDocsPath(relativeReadmePath)
      const label = firstHeading(raw) || fallbackLabel(relativeReadmePath)

      return {
        heading: headingForPath(path),
        label,
        path,
        canonical: true,
      } satisfies DocsEntry
    })
  )

  return entries.sort((a, b) => a.path.localeCompare(b.path))
}

export default defineEventHandler(async () => {
  return readDocsManifest()
})
