import { captureLiveProjection } from 'fireux-core/runtime/server/utils/live-projection'
import { assertFixture } from '../../utils/metrics'

export default defineEventHandler(async () => {
  assertFixture()
  const result = await captureLiveProjection('/api/kitchens', () =>
    globalThis.$fetch.raw('/api/kitchens')
  )
  const sources = result.initial?.sources || []
  return {
    declaredTargets: sources.length,
    authorityTargets: sources.filter((item) => item.authority).length,
    databases: [
      ...new Set(sources.map((item) => item.source.firestore.databaseId)),
    ],
    note: 'One actual directory evaluation. Targets are planned; this endpoint installs no listeners.',
  }
})
