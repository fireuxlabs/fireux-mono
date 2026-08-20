// @fireux-script
// last_used: 2026-07-18
// usage_note: prevents project apps from re-owning package-owned workspace families.
// FILE: scripts/guards/ownership.mjs

import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

const PACKAGE_GROUPS = ['core', 'ecosystem', 'extensions']
const SURFACES = [
  {
    label: 'workspace components',
    packageParts: ['src', 'runtime', 'components', 'Workspace'],
    projectParts: ['app', 'components', 'Workspace'],
  },
  {
    label: 'workspace composables',
    packageParts: ['src', 'runtime', 'composables', 'fireux', 'workspace'],
    projectParts: ['app', 'composables', 'fireux', 'workspace'],
  },
]

function childDirectories(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
}

function collectPackageOwners(repoRoot, surface) {
  const owners = new Map()

  for (const group of PACKAGE_GROUPS) {
    const groupRoot = path.join(repoRoot, 'packages', group)
    for (const packageName of childDirectories(groupRoot)) {
      const packageRoot = path.join(groupRoot, packageName)
      const familyRoot = path.join(packageRoot, ...surface.packageParts)

      for (const family of childDirectories(familyRoot)) {
        const key = family.toLowerCase()
        const current = owners.get(key) ?? []
        current.push(path.relative(repoRoot, path.join(familyRoot, family)))
        owners.set(key, current)
      }
    }
  }

  return owners
}

function collectProjectViolations(repoRoot, surface, owners) {
  const violations = []
  const projectsRoot = path.join(repoRoot, 'projects')

  for (const ecosystem of childDirectories(projectsRoot)) {
    const ecosystemRoot = path.join(projectsRoot, ecosystem)
    for (const app of childDirectories(ecosystemRoot)) {
      const appRoot = path.join(ecosystemRoot, app)
      const familyRoot = path.join(appRoot, ...surface.projectParts)

      for (const family of childDirectories(familyRoot)) {
        const packageOwners = owners.get(family.toLowerCase())
        if (!packageOwners?.length) continue

        violations.push({
          label: surface.label,
          projectPath: path.relative(repoRoot, path.join(familyRoot, family)),
          packageOwners,
        })
      }
    }
  }

  return violations
}

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = SURFACES.flatMap((surface) => {
    const owners = collectPackageOwners(repoRoot, surface)
    return collectProjectViolations(repoRoot, surface, owners)
  })

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ Project apps re-own package-owned workspace families:',
        ...violations.flatMap((violation) => [
          `  - ${violation.projectPath} (${violation.label})`,
          ...violation.packageOwners.map((owner) => `      owner: ${owner}`),
        ]),
        '',
        '[guard] Fix:',
        '- Keep app pages and app-specific composition in the project.',
        '- Move reusable workspace components/composables into the existing owning package family.',
        '- Register the package runtime surface through its module config.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ project apps do not re-own package workspace families')
}
