import { createJiti } from 'jiti'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { AppSearchDemand } from '../../models/search-demand'

export function loadAppSearchDemand(
  appRoot = process.cwd()
): AppSearchDemand | null {
  const source = resolve(appRoot, 'app/search-demand.ts')
  if (!existsSync(source)) return null

  const loadTypeScriptModule = createJiti(import.meta.url)
  const loaded = loadTypeScriptModule(source) as {
    searchDemand?: AppSearchDemand
  }

  if (!loaded.searchDemand) {
    throw new Error(
      `[fireux] App search-demand file must export searchDemand: ${source}`
    )
  }

  return loaded.searchDemand
}
