// @fireux-script
// last_used: 2026-08-18
// usage_note: protects proven domain-owned server capabilities and thin HTTP adapters.

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ADAPTERS = [
  {
    route:
      'packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/targets.get.ts',
    owner: 'kitchen/core/targets',
  },
  {
    route:
      'packages/extensions/fireux-properties/src/runtime/server/api/properties/index.get.ts',
    owner: 'property/index/public-index',
  },
  {
    route:
      'projects/fireux/fireux-app/server/api/internal/control/projects.get.ts',
    owner: 'project/index/read',
  },
  {
    route:
      'projects/fireux/fireux-app/server/api/internal/control/projects/[projectId]/team.get.ts',
    owner: 'project/team/read',
  },
]

export async function run({ repoRoot = process.cwd() } = {}) {
  const violations = []
  const financeOwner =
    'packages/extensions/fireux-finance/src/runtime/server/finance/financial-fact.ts'
  if (!existsSync(path.join(repoRoot, financeOwner))) {
    violations.push(`${financeOwner}: missing Finance-owned server capability`)
  }
  if (
    existsSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-finance/src/runtime/server/financial-fact.ts'
      )
    )
  ) {
    violations.push('Finance capability returned to the server root')
  }

  for (const { route, owner } of ADAPTERS) {
    const source = readFileSync(path.join(repoRoot, route), 'utf8')
    if (!source.includes(owner)) {
      violations.push(`${route}: does not delegate to ${owner}`)
    }
    if (
      /getRuntimeFirestore|getFirestoreDb|\.collection\(|runGuardedServerTransaction/.test(
        source
      )
    ) {
      violations.push(`${route}: HTTP adapter contains storage or domain logic`)
    }
  }

  if (violations.length) {
    throw new Error(`Server ownership drifted:\n- ${violations.join('\n- ')}`)
  }
}
