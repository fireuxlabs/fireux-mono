// @fireux-script
// last_used: 2026-08-18
// usage_note: protects the vertical server shape and shared onboarding authority of Console Entities.

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
])

const ENTITY_ROOTS = [
  'packages/extensions/fireux-kitchens/src/runtime/server/kitchen',
  'packages/extensions/fireux-suppliers/src/runtime/server/supplier',
  'packages/extensions/fireux-properties/src/runtime/server/portfolio',
  'packages/extensions/fireux-properties/src/runtime/server/property',
  'projects/fireux/fireux-app/server/project',
]

const ONBOARDING_CONSUMERS = [
  'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/index/onboarding/onboarding-policy.ts',
  'packages/extensions/fireux-suppliers/src/runtime/server/supplier/index/onboarding.ts',
  'packages/extensions/fireux-properties/src/runtime/server/portfolio/index/onboarding/authority.ts',
  'packages/extensions/fireux-properties/src/runtime/server/property/index/onboarding.ts',
]

export async function run({ repoRoot = process.cwd() } = {}) {
  const violations = []
  for (const relativeRoot of ENTITY_ROOTS) {
    const root = path.join(repoRoot, relativeRoot)
    if (!existsSync(root)) {
      violations.push(`${relativeRoot}: missing Console Entity server root`)
      continue
    }
    for (const entry of readdirSync(root)) {
      const absolute = path.join(root, entry)
      if (!statSync(absolute).isDirectory()) {
        violations.push(`${relativeRoot}/${entry}: loose entity-root file`)
      } else if (!ALLOWED_SLICES.has(entry)) {
        violations.push(`${relativeRoot}/${entry}/: non-canonical server slice`)
      }
    }
  }

  for (const relative of ONBOARDING_CONSUMERS) {
    const source = readFileSync(path.join(repoRoot, relative), 'utf8')
    if (!source.includes('server/utils/console-entity/onboarding-authority')) {
      violations.push(
        `${relative}: bypasses shared Console Entity onboarding authority`
      )
    }
  }

  if (violations.length) {
    throw new Error(
      `Console Entity server canon drifted:\n- ${violations.join('\n- ')}`
    )
  }
}
