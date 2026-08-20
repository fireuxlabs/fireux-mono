// @fireux-script
// last_used: 2026-08-19
// usage_note: protects the entity-scoped Nuxt runtime and rejects completed legacy placements.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { entityMatrix } from '../_lib/entity-matrix.mjs'

const ENTITY_TECHNICAL_ROLES = new Set([
  'components',
  'composables',
  'models',
  'server',
  'utils',
  'demo',
  'tools',
])

const LEGACY_ENTITY_PATHS = [
  // Core entities. Entity-owned App components and composables use the App
  // scoped Nuxt spine; the old global App-labelled dumping grounds are closed.
  'packages/core/fireux-core/src/runtime/components/App',
  'packages/core/fireux-core/src/runtime/composables/fireux/app',
  'packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/AppImages.vue',
  'packages/core/fireux-core/src/runtime/components/Workspace/Project',
  'packages/core/fireux-core/src/runtime/components/Ecosystem',
  'packages/core/fireux-core/src/runtime/components/Project',
  'packages/core/fireux-core/src/runtime/components/User',
  'packages/core/fireux-core/src/runtime/composables/fireux/workspace/project',
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
  'packages/extensions/fireux-properties/src/runtime/components/Workspace/Portfolio',
  'packages/extensions/fireux-properties/src/runtime/components/Workspace/Property',
  'packages/extensions/fireux-properties/src/runtime/composables/fireux/portfolio',
  'packages/extensions/fireux-properties/src/runtime/composables/fireux/property',
  'packages/extensions/fireux-properties/src/runtime/server/portfolio',
  'packages/extensions/fireux-properties/src/runtime/server/property',
  'packages/extensions/fireux-suppliers/src/runtime/components/Supplier',
  'packages/extensions/fireux-suppliers/src/runtime/components/Workspace/Supplier',
  'packages/extensions/fireux-suppliers/src/runtime/components/dev/Supplier',
  'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/supplier',
  'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier',
  'packages/extensions/fireux-suppliers/src/runtime/server/supplier',
  'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/components/Menu',
  'packages/extensions/fireux-kitchens/src/runtime/components/Ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/components/Workspace/Kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/components/dev/Kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/components/dev/Menu',
  'packages/extensions/fireux-kitchens/src/runtime/components/dev/Ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/menu',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/workspace/kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/menu',
  'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/server/kitchen',
  'packages/extensions/fireux-kitchens/src/runtime/server/menu',
  'packages/extensions/fireux-kitchens/src/runtime/server/ingredient',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/public-identity.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/public-projection.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/public-index.ts',
  'packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-index.model.ts',
  'packages/extensions/fireux-kitchens/src/runtime/menu/composables/usePublicMenuIndex.ts',
  'packages/extensions/fireux-kitchens/src/runtime/menu/composables/useMenuDirectory.ts',
  'packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/fetch/useMenuCollection.ts',

  // Confirmed parent-owned records and Workspace operations.
  'packages/extensions/fireux-companies/src/runtime/components/Company',
  'packages/extensions/fireux-companies/src/runtime/composables/fireux/company',
  'packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/company',
  'packages/extensions/fireux-companies/src/runtime/server/company',
  'packages/extensions/fireux-compliance/src/runtime/composables/fireux/workspace/portfolio/operations/Compliance',
  'packages/extensions/fireux-documents/src/runtime/composables/fireux/workspace/portfolio/operations/Documents',
  'packages/extensions/fireux-tasks/src/runtime/composables/fireux/workspace/portfolio/operations/Tasks',
  'packages/extensions/fireux-reservations/src/runtime/components/Workspace/Property',
  'packages/extensions/fireux-reservations/src/runtime/composables/fireux/workspace/property/operations/Reservations',
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

const RETIRED_ENTITY_IMPORTS = new Map([
  [
    'packages/extensions/fireux-kitchens/src/runtime/user/components/Delivery/CoverageMap.vue',
    ['fireux-places/runtime/composables/fireux/places/useGoogleMaps'],
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/utils/view/useKitchenInterface.ts',
    [
      'fireux-places/runtime/composables/fireux/firestore/place/utils/view/formatPlaceAddress',
    ],
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Detail/Place.vue',
    ['fireux-places/runtime/composables/fireux/firestore/place/usePlace'],
  ],
  [
    'packages/core/fireux-core/src/runtime/composables/forms/useEditableStringField.ts',
    ["from '../fireux/utils/slug/normalizeSlug'"],
  ],
  [
    'packages/extensions/fireux-jobs/src/runtime/server/api/jobs/[id].get.ts',
    ['../../../utils/job/public-projection.ts'],
  ],
  [
    'packages/extensions/fireux-jobs/src/runtime/job/server/identity/author.ts',
    ['fireux-places/runtime/place/server/identity/public-projection'],
  ],
  [
    'packages/extensions/fireux-jobs/src/runtime/job/server/identity/read.ts',
    ['fireux-places/runtime/place/server/identity/public-projection'],
  ],
  [
    'packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/reports/gross-sales.get.ts',
    ['server/kitchen/operations/sales/gross-sales-report.ts'],
  ],
  [
    'packages/ecosystem/fireux-misebox/src/runtime/server/agent/kitchen/index.ts',
    ['fireux-kitchens/runtime/server/kitchen/'],
  ],
  [
    'packages/extensions/fireux-places/src/runtime/place/server/index/onboarding/context.ts',
    ["from '../../utils/place-spine'"],
  ],
  [
    'packages/extensions/fireux-places/src/runtime/place/server/index/onboarding/values.ts',
    ["from '../../utils/place-spine'"],
  ],
])

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
  const entityRoots = new Set()

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
      continue
    }

    entityRoots.add(entity.source.slice(0, entity.source.indexOf('/models/')))
  }

  for (const relativeRoot of entityRoots) {
    const root = path.join(repoRoot, relativeRoot)
    if (!existsSync(root)) {
      violations.push(
        `${relativeRoot}: declared Entity runtime root is missing`
      )
      continue
    }

    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') continue
      const relativeEntry = `${relativeRoot}/${entry.name}`
      if (!entry.isDirectory()) {
        violations.push(`${relativeEntry}: loose Entity-root file`)
        continue
      }
      if (
        !ENTITY_TECHNICAL_ROLES.has(entry.name) &&
        hasAuthoredFile(path.join(root, entry.name))
      ) {
        violations.push(
          `${relativeEntry}/: Entity root must use a scoped Nuxt technical role`
        )
      }
    }
  }

  for (const relativePath of LEGACY_ENTITY_PATHS) {
    const target = path.join(repoRoot, relativePath)
    if (existsSync(target) && !readdirSafe(target)) {
      violations.push(`${relativePath}: completed legacy Entity path returned`)
    }
  }

  for (const [relativePath, retiredImports] of RETIRED_ENTITY_IMPORTS) {
    const source = readFileSync(path.join(repoRoot, relativePath), 'utf8')
    for (const retiredImport of retiredImports) {
      if (source.includes(retiredImport)) {
        violations.push(
          `${relativePath}: retired Entity import returned (${retiredImport})`
        )
      }
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] Entity runtime ownership drifted:',
        ...violations.map((violation) => `- ${violation}`),
        '',
        'Shared/system code stays in the root Nuxt spine. Entity-owned code belongs under runtime/<entity>/{components,composables,models,server,utils,demo,tools}.',
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
