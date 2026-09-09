// @fireux-script
// last_used: 2026-08-18
// usage_note: protects the vertical server shape and shared onboarding authority of Workspace Entities.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ALLOWED_SLICES = new Set([
  'core',
  'index',
  'overview',
  'identity',
  'team',
  'operations',
  'ai',
  'test',
])

const ENTITY_ROOTS = [
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/server',
  'packages/extensions/fireux-suppliers/src/runtime/supplier/server',
  'packages/extensions/fireux-properties/src/runtime/portfolio/server',
  'packages/extensions/fireux-properties/src/runtime/property/server',
  'projects/fireux/fireux-app/server/project',
]

const ONBOARDING_CONSUMERS = [
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/onboarding/onboarding-policy.ts',
  'packages/extensions/fireux-suppliers/src/runtime/supplier/server/index/onboarding.ts',
  'packages/extensions/fireux-properties/src/runtime/portfolio/server/index/onboarding/authority.ts',
  'packages/extensions/fireux-properties/src/runtime/property/server/index/onboarding.ts',
]

export async function run({ repoRoot = process.cwd() } = {}) {
  const violations = []
  for (const relativeRoot of ENTITY_ROOTS) {
    const root = path.join(repoRoot, relativeRoot)
    if (!existsSync(root)) {
      violations.push(`${relativeRoot}: missing Workspace Entity server root`)
      continue
    }
    for (const entry of readdirSync(root)) {
      const absolute = path.join(root, entry)
      if (!statSync(absolute).isDirectory()) {
        violations.push(`${relativeRoot}/${entry}: loose entity-root file`)
      } else if (!ALLOWED_SLICES.has(entry) && !(entry === 'menus' && relativeRoot === 'packages/extensions/fireux-kitchens/src/runtime/kitchen/server')) {
        violations.push(`${relativeRoot}/${entry}/: non-canonical server slice`)
      }
    }
  }

  for (const relative of ONBOARDING_CONSUMERS) {
    const source = readFileSync(path.join(repoRoot, relative), 'utf8')
    if (!source.includes('server/utils/workspace-entity/onboarding-authority')) {
      violations.push(
        `${relative}: bypasses shared Workspace Entity onboarding authority`
      )
    }
  }

  if (violations.length) {
    throw new Error(
      `Workspace Entity server canon drifted:\n- ${violations.join('\n- ')}`
    )
  }
}
