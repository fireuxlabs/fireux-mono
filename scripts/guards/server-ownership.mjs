// @fireux-script
// last_used: 2026-08-18
// usage_note: protects proven domain-owned server capabilities and thin HTTP adapters.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ADAPTERS = [
  {
    route:
      'packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/targets.get.ts',
    owner: 'kitchen/server/core/targets',
  },
  {
    route:
      'packages/extensions/fireux-properties/src/runtime/server/api/properties/index.get.ts',
    owner: 'property/server/index/public-index',
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
  {
    route:
      'packages/extensions/fireux-kitchens/src/runtime/server/api/customer/orders.get.ts',
    owner: 'customer/orders/read',
  },
  {
    route:
      'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/index.get.ts',
    owner: 'menu/server/index/read',
  },
  {
    route:
      'packages/extensions/fireux-places/src/runtime/server/api/places/logo.get.ts',
    owner: 'place/server/integration/logo',
  },
]

const DELEGATED_OWNERS = [
  {
    owner:
      'packages/extensions/fireux-kitchens/src/runtime/user/server/customer/orders/read.ts',
    delegates: ['./kitchens', './projection'],
  },
  {
    owner:
      'packages/extensions/fireux-kitchens/src/runtime/menu/server/index/read.ts',
    delegates: ['./context', './projection'],
  },
]

const DOMAIN_ROOTS = [
  {
    root: 'packages/extensions/fireux-kitchens/src/runtime/kitchen/server',
    slices: ['ai', 'core', 'identity', 'index', 'operations', 'team'],
    surfaces: [
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/overview.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/identity/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/team.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/drinks/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menus/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/mise/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/stations.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/tables/index.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/finance.vue',
    ],
  },
  {
    root: 'packages/extensions/fireux-suppliers/src/runtime/supplier/server',
    slices: ['identity', 'index', 'operations'],
    surfaces: [
      'packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/index.vue',
      'packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/overview.vue',
      'packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/identity.vue',
      'packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/team.vue',
      'packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/items.vue',
      'packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/ingredients.vue',
      'packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/catalogue.vue',
    ],
  },
  {
    root: 'projects/fireux/fireux-app/server/project',
    slices: ['core', 'identity', 'index', 'team'],
    surfaces: [
      'projects/fireux/fireux-app/app/pages/console/project/index.vue',
      'projects/fireux/fireux-app/app/pages/console/project/overview.vue',
      'projects/fireux/fireux-app/app/pages/console/project/identity.vue',
      'projects/fireux/fireux-app/app/pages/console/project/team.vue',
      'projects/fireux/fireux-app/app/pages/console/project/apps.vue',
      'projects/fireux/fireux-app/app/pages/console/project/ecosystem.vue',
    ],
  },
  {
    root: 'packages/extensions/fireux-marketplace/src/runtime/marketplace-store/server',
    slices: ['core', 'directory', 'moderation', 'offers', 'orders', 'stores'],
  },
  {
    root: 'packages/extensions/fireux-jobs/src/runtime/job/server',
    slices: ['core', 'identity', 'index', 'operations'],
  },
  {
    root: 'packages/extensions/fireux-places/src/runtime/place/server',
    slices: ['identity', 'index', 'integration'],
  },
]

export async function run({ repoRoot = process.cwd() } = {}) {
  const violations = []

  for (const { root: relativeRoot, slices, surfaces = [] } of DOMAIN_ROOTS) {
    const root = path.join(repoRoot, relativeRoot)
    const allowed = new Set(slices)
    for (const entry of readdirSync(root)) {
      const absolute = path.join(root, entry)
      if (!statSync(absolute).isDirectory()) {
        violations.push(`${relativeRoot}/${entry}: loose domain-root file`)
      } else if (!allowed.has(entry)) {
        violations.push(
          `${relativeRoot}/${entry}/: owner is not a proven domain slice`
        )
      }
    }
    for (const relativeSurface of surfaces) {
      if (!existsSync(path.join(repoRoot, relativeSurface))) {
        violations.push(
          `${relativeRoot}: declared server shape lost its product surface ${relativeSurface}`
        )
      }
    }
  }

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

  for (const { owner, delegates } of DELEGATED_OWNERS) {
    const source = readFileSync(path.join(repoRoot, owner), 'utf8')
    for (const delegate of delegates) {
      if (!source.includes(delegate)) {
        violations.push(`${owner}: no longer delegates to ${delegate}`)
      }
    }
  }

  if (violations.length) {
    throw new Error(`Server ownership drifted:\n- ${violations.join('\n- ')}`)
  }
}
