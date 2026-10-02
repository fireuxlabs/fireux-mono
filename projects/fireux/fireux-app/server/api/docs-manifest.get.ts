import { defineEventHandler } from 'h3'
import { basename, dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, readdir } from 'node:fs/promises'

type DocsEntry = {
  heading: string
  label: string
  path: string
  canonical: boolean
}

function firstHeading(raw: string) {
  return raw
    .split('\n')
    .find((line) => line.startsWith('# '))
    ?.slice(2)
    .trim()
}

function slug(file: string) {
  return basename(file, extname(file)).toLowerCase()
}

async function entriesBelow(
  root: string,
  heading: string,
  prefix: string
): Promise<DocsEntry[]> {
  const files = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort()
  return Promise.all(
    files.map(async (file) => ({
      heading,
      label: firstHeading(await readFile(resolve(root, file), 'utf8')) || slug(file),
      path: `${prefix}/${slug(file)}`,
      canonical: true,
    }))
  )
}

export default defineEventHandler(async () => {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const repoRoot = resolve(currentDir, '../../../../..')
  const agentGuide = resolve(repoRoot, 'AGENTS.md')
  const entries: DocsEntry[] = [
    {
      heading: 'Governance',
      label:
        firstHeading(await readFile(agentGuide, 'utf8')) || 'Working agreement',
      path: '/governance/agents',
      canonical: true,
    },
    ...(await entriesBelow(resolve(repoRoot, 'docs/ai'), 'Agent context', '/ai')),
    ...(await entriesBelow(resolve(repoRoot, 'packages/ecosystem/fireux-misebox/docs/ai'), 'Misebox agent context', '/ai/misebox')),
    ...(await entriesBelow(resolve(repoRoot, 'packages/ecosystem/fireux-werkbox/docs/ai'), 'Werkbox agent context', '/ai/werkbox')),
    ...(await entriesBelow(resolve(repoRoot, 'packages/ecosystem/fireux-buenohost/docs/ai'), 'Buenohost agent context', '/ai/buenohost')),
    ...(await entriesBelow(resolve(repoRoot, 'packages/ecosystem/fireux-sharer/docs/ai'), 'Sharer agent context', '/ai/sharer')),
    ...(await entriesBelow(resolve(repoRoot, 'packages/ecosystem/fireux-slap/docs/ai'), 'Slap agent context', '/ai/slap')),
    ...(await entriesBelow(
      resolve(repoRoot, 'docs/concepts'),
      'Concept maps',
      '/concepts'
    )),
  ]

  return entries
})
