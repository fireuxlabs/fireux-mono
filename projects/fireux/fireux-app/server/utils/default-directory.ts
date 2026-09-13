import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
import { projectEcosystemDirectoryEntry } from 'fireux-core/runtime/ecosystem/server/directory/projection'
import {
  PLATFORM_DIRECTORY_TARGETS,
  type PlatformDirectoryTarget,
} from '../config/platform-directory-targets'
export {
  isDirectoryAppIndexable,
  isDirectoryEcosystemIndexable,
} from '../../app/utils/directorySearchPolicy'
import { readPlatformApps } from './apps'

import { readPlatformEcosystems } from './ecosystems'

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export async function readPlatformDirectory(): Promise<PlatformDirectoryResponse> {
  const directories = await readPlatformEcosystems()
  const rawApps = await readPlatformApps()
  const appCounts = new Map<string, number>()
  for (const raw of rawApps) {
    const ecosystemId = text(raw.ecosystem_id)
    if (!ecosystemId) continue
    appCounts.set(ecosystemId, (appCounts.get(ecosystemId) || 0) + 1)
  }

  const ecosystems = directories
    .filter((ecosystem) => text(ecosystem.status) === 'active')
    .map((ecosystem) => {
      const target: PlatformDirectoryTarget | undefined = PLATFORM_DIRECTORY_TARGETS.find(value => value.ecosystemId === ecosystem.id)
      const entry = projectEcosystemDirectoryEntry(ecosystem, {
        id: ecosystem.id,
        appCount: appCounts.get(ecosystem.id) || 0,
      })
      return entry && target?.detailPath
        ? { ...entry, detail_url: target?.detailPath }
        : entry
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    ecosystems,
  }
}
