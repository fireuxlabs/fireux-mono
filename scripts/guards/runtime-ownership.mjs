// @fireux-script
// last_used: 2026-08-18
// usage_note: protects the entity-scoped Nuxt runtime and rejects completed legacy placements.

import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { entityMatrix } from '../_lib/entity-matrix.mjs'

const LEGACY_ENTITY_PATHS = [
  // Core entities. App shell files intentionally remain under components/App
  // and composables/fireux/app; only canonical App entity capabilities moved.
  'packages/core/fireux-core/src/runtime/components/App/CTA.vue',
  'packages/core/fireux-core/src/runtime/components/App/Cards',
  'packages/core/fireux-core/src/runtime/components/App/Collection',
  'packages/core/fireux-core/src/runtime/components/App/Create',
  'packages/core/fireux-core/src/runtime/components/App/Edit',
  'packages/core/fireux-core/src/runtime/components/App/Initialize',
  'packages/core/fireux-core/src/runtime/components/App/Join',
  'packages/core/fireux-core/src/runtime/components/App/Profile.vue',
  'packages/core/fireux-core/src/runtime/components/Console/Project',
  'packages/core/fireux-core/src/runtime/components/Ecosystem',
  'packages/core/fireux-core/src/runtime/components/Project',
  'packages/core/fireux-core/src/runtime/components/User',
  'packages/core/fireux-core/src/runtime/composables/fireux/console/project',
  'packages/core/fireux-core/src/runtime/composables/fireux/ecosystem',
  'packages/core/fireux-core/src/runtime/composables/fireux/project',
  'packages/core/fireux-core/src/runtime/composables/fireux/user',
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app',
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/ecosystem',
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user',
  'packages/core/fireux-core/src/runtime/composables/fireux/public/app/useEcosystemAppCollection.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/public/user',
  'packages/core/fireux-core/src/runtime/models/core/app.model.ts',
  'packages/core/fireux-core/src/runtime/models/core/ecosystem.model.ts',
  'packages/core/fireux-core/src/runtime/models/core/user.model.ts',
  'packages/core/fireux-core/src/runtime/models/system/project.model.ts',
  'packages/core/fireux-core/src/runtime/server/utils/app-initialization',
  'packages/core/fireux-core/src/runtime/server/utils/app-membership',
  'packages/core/fireux-core/src/runtime/server/utils/app-projection',
  'packages/core/fireux-core/src/runtime/server/utils/app-scope',
  'packages/core/fireux-core/src/runtime/server/utils/project-user-join',
  'packages/core/fireux-core/src/runtime/server/utils/user-account',
  'packages/core/fireux-core/src/runtime/server/utils/user-handle',

  // Extension entities whose complete bounded slices have moved.
  'packages/extensions/fireux-places/src/runtime/components/Place',
  'packages/extensions/fireux-places/src/runtime/components/dev/Place',
  'packages/extensions/fireux-places/src/runtime/composables/fireux/place',
  'packages/extensions/fireux-places/src/runtime/composables/fireux/places',
  'packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place',
  'packages/extensions/fireux-places/src/runtime/server/place',
  'packages/extensions/fireux-jobs/src/runtime/components/Job',
  'packages/extensions/fireux-jobs/src/runtime/components/dev/Job',
  'packages/extensions/fireux-jobs/src/runtime/composables/fireux/jobs',
  'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs',
  'packages/extensions/fireux-jobs/src/runtime/server/job',
  'packages/extensions/fireux-marketplace/src/runtime/server/marketplace',
  'packages/extensions/fireux-products/src/runtime/components/Product',
  'packages/extensions/fireux-products/src/runtime/components/dev/Product',
  'packages/extensions/fireux-products/src/runtime/composables/fireux/product',
  'packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product',
  'packages/extensions/fireux-products/src/runtime/server/product',
  'packages/extensions/fireux-properties/src/runtime/components/Portfolio',
  'packages/extensions/fireux-properties/src/runtime/components/Property',
  'packages/extensions/fireux-properties/src/runtime/components/Console/Portfolio',
  'packages/extensions/fireux-properties/src/runtime/components/Console/Property',
  'packages/extensions/fireux-properties/src/runtime/composables/fireux/portfolio',
  'packages/extensions/fireux-properties/src/runtime/composables/fireux/property',
  'packages/extensions/fireux-properties/src/runtime/server/portfolio',
  'packages/extensions/fireux-properties/src/runtime/server/property',
  'packages/extensions/fireux-suppliers/src/runtime/components/Supplier',
  'packages/extensions/fireux-suppliers/src/runtime/components/Console/Supplier',
  'packages/extensions/fireux-suppliers/src/runtime/components/dev/Supplier',
  'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/supplier',
  'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier',
  'packages/extensions/fireux-suppliers/src/runtime/server/supplier',
  'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/components/Menu',
  'packages/extensions/fireux-kitchens/src/runtime/components/Ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/components/dev/Kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/components/dev/Menu',
  'packages/extensions/fireux-kitchens/src/runtime/components/dev/Ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/menu',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/menu',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/server/kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/server/menu',
  'packages/extensions/fireux-kitchens/src/runtime/server/ingredient',

  // Confirmed parent-owned records and Console operations.
  'packages/extensions/fireux-companies/src/runtime/components/Company',
  'packages/extensions/fireux-companies/src/runtime/composables/fireux/company',
  'packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company',
  'packages/extensions/fireux-companies/src/runtime/server/company',
  'packages/extensions/fireux-compliance/src/runtime/composables/fireux/console/portfolio/operations/Compliance',
  'packages/extensions/fireux-documents/src/runtime/composables/fireux/console/portfolio/operations/Documents',
  'packages/extensions/fireux-tasks/src/runtime/composables/fireux/console/portfolio/operations/Tasks',
  'packages/extensions/fireux-reservations/src/runtime/components/Console/Property',
  'packages/extensions/fireux-reservations/src/runtime/composables/fireux/console/property/operations/Reservations',
  'packages/extensions/fireux-reservations/src/runtime/server/reservation',
  'packages/extensions/fireux-kitchens/src/runtime/components/Chef',
  'packages/extensions/fireux-kitchens/src/runtime/components/Customer',
  'packages/extensions/fireux-kitchens/src/runtime/components/Delivery',
  'packages/extensions/fireux-kitchens/src/runtime/components/Driver',
  'packages/extensions/fireux-kitchens/src/runtime/components/dev/Chef',
  'packages/extensions/fireux-kitchens/src/runtime/components/dev/Supplier',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/chef',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/customer',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/driver',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Customer',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Driver',
  'packages/extensions/fireux-kitchens/src/runtime/models/chef.model.ts',
  'packages/extensions/fireux-kitchens/src/runtime/models/customer.model.ts',
  'packages/extensions/fireux-kitchens/src/runtime/models/customer',
  'packages/extensions/fireux-kitchens/src/runtime/models/driver.model.ts',
  'packages/extensions/fireux-kitchens/src/runtime/models/driver',
  'packages/extensions/fireux-kitchens/src/runtime/server/customer',
  'packages/extensions/fireux-kitchens/src/runtime/server/driver',
  'packages/extensions/fireux-products/src/runtime/models/core/user.ext.ts',
  'packages/extensions/fireux-blogs/src/runtime/models/core/user.ext.ts',
]

function hasAuthoredFile(target) {
  if (!existsSync(target)) return false
  const pending = [target]

  while (pending.length) {
    const current = pending.pop()
    if (!current) continue
    const entries = readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === '.DS_Store') continue
      if (entry.isFile()) return true
      if (entry.isDirectory()) pending.push(path.join(current, entry.name))
    }
  }

  return false
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const violations = []

  for (const entity of entityMatrix) {
    if (
      entity.state !== 'declared' ||
      entity.classification.kind !== 'entity'
    ) {
      continue
    }

    const runtimePath = entity.source.split('/src/runtime/')[1]
    const segments = runtimePath?.split('/') ?? []
    if (segments.length < 3 || segments[1] !== 'models') {
      violations.push(
        `${entity.source}: declared Entity model must live at runtime/<entity>/models`
      )
    }
  }

  for (const relativePath of LEGACY_ENTITY_PATHS) {
    const target = path.join(repoRoot, relativePath)
    if (existsSync(target) && !readdirSafe(target)) {
      violations.push(`${relativePath}: completed legacy Entity path returned`)
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] Entity runtime ownership drifted:',
        ...violations.map((violation) => `- ${violation}`),
        '',
        'Shared/system code stays in the root Nuxt spine. Entity-owned code belongs under runtime/<entity>/<role>.',
      ].join('\n')
    )
  }
}

function readdirSafe(target) {
  try {
    const entry = readdirSync(path.dirname(target), {
      withFileTypes: true,
    }).find(
      (candidate) => path.join(path.dirname(target), candidate.name) === target
    )
    if (!entry) return true
    return entry.isDirectory() ? !hasAuthoredFile(target) : false
  } catch {
    return true
  }
}
