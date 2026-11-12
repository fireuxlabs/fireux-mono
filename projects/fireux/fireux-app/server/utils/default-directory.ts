import type { PlatformDirectoryResponse } from '../../shared/platform-directory'
import { toEcosystemDirectoryEntry } from 'fireux-core/runtime/ecosystem/server/directory/projection'
import { readPlatformApps } from './apps'
import { readPlatformEcosystems } from './ecosystems'

export async function readPlatformDirectory(): Promise<PlatformDirectoryResponse> {
  const [directories, apps] = await Promise.all([
    readPlatformEcosystems(),
    readPlatformApps({ requireComplete: true }),
  ])
  const appCounts = new Map<string, number>()
  for (const app of apps) {
    const ecosystemId = app.ecosystem_id.trim()
    appCounts.set(ecosystemId, (appCounts.get(ecosystemId) ?? 0) + 1)
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
