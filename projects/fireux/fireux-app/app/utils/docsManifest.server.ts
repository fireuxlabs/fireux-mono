import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFile, stat } from 'node:fs/promises'
import type { Stats } from 'node:fs'

import { parseManifest, type DocsEntry } from '~/utils/docsManifest'

function resolveManifestPath(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  return resolve(currentDir, '../../../../../docs/_manifest.md')
}

export async function readDocsManifest(): Promise<DocsEntry[]> {
  const manifestPath = resolveManifestPath()

  let fileStat: Stats
  try {
    fileStat = await stat(manifestPath)
  } catch (error) {
    throw new Error(
      `Unable to resolve documentation manifest at ${manifestPath}: ${
        (error as Error).message
      }`
    )
  }

  if (!fileStat.isFile()) {
    throw new Error(`Documentation manifest is not a file: ${manifestPath}`)
  }

  const raw = await readFile(manifestPath, 'utf-8')
  return parseManifest(raw)
}
