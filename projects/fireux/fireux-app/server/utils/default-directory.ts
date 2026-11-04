import type { PlatformDirectoryResponse } from 'fireux-core/runtime/models/utils/directory'
import { toEcosystemDirectoryEntry } from 'fireux-core/runtime/ecosystem/server/directory/projection'
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
    .map((ecosystem) =>
      toEcosystemDirectoryEntry(ecosystem, {
        appCount: appCounts.get(ecosystem.id) ?? 0,
        detailUrl: `/ecosystems/${encodeURIComponent(ecosystem.id)}`,
      })
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    ecosystems,
  }
}
