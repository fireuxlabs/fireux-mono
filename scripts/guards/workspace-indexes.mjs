// @fireux-script
// last_used: 2026-08-23
// usage_note: keeps Workspace state minimal and domain entity collections explicit.
// FILE: scripts/guards/workspace-indexes.mjs

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const REMOVED_FILES = [
  'useWorkspaceDemoData.ts',
  'useWorkspaceDirectoryIndex.ts',
  'useWorkspaceEntityRuntime.ts',
  'useWorkspaceFamilyRuntime.ts',
  'useWorkspaceSelection.ts',
  'useWorkspaceOverview.ts',
  'useWorkspaceData.ts',
  'useWorkspaceDataAuthority.ts',
  'useWorkspaceTargets.ts',
  'useWorkspaceTargetRequest.ts',
]
const REMOVED_SOURCE_NAMES = [
  'useWorkspaceDirectoryIndex',
  'useWorkspaceEntityRuntime',
  'useWorkspaceFamilyRuntime',
  'useWorkspaceSelection',
  'useWorkspaceOverview',
  'useWorkspaceDataAuthority',
  'workspaceData(',
  'WorkspaceSelectedTarget',
  'WorkspaceTargetCollection',
]
const REMOVED_DOMAIN_FILES = [
  'packages/core/fireux-core/src/runtime/project/composables/workspace/core/useProjectWorkspaceDemoData.ts',
  'packages/core/fireux-core/src/runtime/project/composables/workspace/core/useProjectWorkspaceDemoTargets.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspaceDemoMenuService.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspaceDemoData.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspaceDemoTargets.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/Suppliers/useKitchenWorkspaceSupplyWorkspace.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/Dishes/useKitchenWorkspaceDishFinance.ts',
  'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Dishes/Finance.vue',
  'packages/extensions/fireux-properties/src/runtime/composables/fireux/workspace/shared/usePropertiesWorkspaceDemoData.ts',
  'packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/core/usePortfolioWorkspaceDemoData.ts',
  'packages/extensions/fireux-properties/src/runtime/property/composables/workspace/core/usePropertyWorkspaceDemoData.ts',
  'packages/extensions/fireux-reservations/src/runtime/property/composables/workspace/operations/Reservations/usePropertyReservationDemoData.ts',
  'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/core/useSupplierWorkspaceDemoData.ts',
  'projects/fireux/fireux-blank/app/composables/fireux/workspace/blank/core/useBlankWorkspaceDemoData.ts',
]
const DOMAIN_WORKSPACES = [
  [
    'project',
    'packages/core/fireux-core/src/runtime/project/composables/workspace/core/useProjectWorkspace.ts',
    'packages/core/fireux-core/src/runtime/project/composables/workspace/index/useProjectWorkspaceIndex.ts',
  ],
  [
    'kitchen',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspace.ts',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex.ts',
  ],
  [
    'portfolio',
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/core/usePortfolioWorkspace.ts',
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/index/usePortfolioWorkspaceIndex.ts',
  ],
  [
    'property',
    'packages/extensions/fireux-properties/src/runtime/property/composables/workspace/core/usePropertyWorkspace.ts',
    'packages/extensions/fireux-properties/src/runtime/property/composables/workspace/index/usePropertyWorkspaceIndex.ts',
  ],
  [
    'supplier',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/core/useSupplierWorkspace.ts',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/index/useSupplierWorkspaceIndex.ts',
  ],
  [
    'blank',
    'projects/fireux/fireux-blank/app/composables/fireux/workspace/blank/core/useBlankWorkspace.ts',
    'projects/fireux/fireux-blank/app/composables/fireux/workspace/blank/index/useBlankWorkspaceIndex.ts',
  ],
]

const DOMAIN_WORKSPACE_INDEXES = [
  'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/index.vue',
  'packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/index.vue',
  'packages/extensions/fireux-properties/src/runtime/pages/workspace/property/index.vue',
]

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const files = []
  const violations = []
  for (const rootName of SOURCE_ROOTS) {
    const root = path.join(repoRoot, rootName)
    if (existsSync(root)) collectFiles(root, files)
  }

  const workspaceRoot = path.join(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace'
  )
  for (const file of REMOVED_FILES) {
    if (existsSync(path.join(workspaceRoot, file))) {
      violations.push(
        `Core Workspace still contains removed compatibility file ${file}`
      )
    }
  }
  for (const relativeFile of REMOVED_DOMAIN_FILES) {
    if (existsSync(path.join(repoRoot, relativeFile))) {
      violations.push(`Workspace still contains removed Demo file ${relativeFile}`)
    }
  }

  const workspaceSource = readFileSync(
    path.join(workspaceRoot, 'useWorkspace.ts'),
    'utf8'
  )
  for (const required of ['selectedId', 'select', 'clear']) {
    if (!workspaceSource.includes(required)) {
      violations.push(`useWorkspace must expose ${required}`)
    }
  }
  for (const forbidden of [
    'targets',
    'collection',
    'demo',
    'test',
    'operation',
  ]) {
    if (new RegExp(`\\b${forbidden}\\b`, 'i').test(workspaceSource)) {
      violations.push(`useWorkspace must remain ignorant of ${forbidden}`)
    }
  }

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const removed of REMOVED_SOURCE_NAMES) {
      if (source.includes(removed)) {
        violations.push(
          `${relative(repoRoot, file)} still consumes removed ${removed}`
        )
      }
    }

    const sourcePath = relative(repoRoot, file)
    if (
      sourcePath.includes('/composables/workspace/') &&
      (/use\w*WorkspaceDemo(?:Data|Targets)/.test(source) || /\bisDemo\b/.test(source))
    ) {
      violations.push(
        `${sourcePath} makes Demo part of the live Workspace pipeline`
      )
    }
    if (
      sourcePath.includes('/composables/workspace/') &&
      (/(?:project|kitchen)Workspace\.(?:runtime|selection|targets|actions)\b/.test(source) ||
        /\{[^}]*\b(?:runtime|selection|targets|actions)\b[^}]*\}\s*=\s*use(?:Project|Kitchen)Workspace\(\)/s.test(source))
    ) {
      violations.push(
        `${sourcePath} consumes a retired layered Workspace bridge field`
      )
    }
  }

  for (const [workspace, relativeFile, indexFile] of DOMAIN_WORKSPACES) {
    const fullPath = path.join(repoRoot, relativeFile)
    if (!existsSync(fullPath)) {
      violations.push(`${relativeFile} is missing`)
      continue
    }
    const source = readFileSync(fullPath, 'utf8')
    const publicSource = source.slice(source.lastIndexOf('return {'))
    for (const field of ['data', 'id', 'outcome', 'crud', 'create', 'update', 'delete']) {
      if (!new RegExp(`\\b${field}\\s*[:,}]`).test(publicSource)) violations.push(`${relativeFile} must expose ${field}`)
    }
    for (const forbidden of ['choices:', 'selectedId:', 'selection:', 'runtime:', 'actions:']) {
      if (publicSource.includes(forbidden)) violations.push(`${relativeFile} must not expose ${forbidden}`)
    }
    const indexPath = path.join(repoRoot, indexFile)
    if (!existsSync(indexPath)) {
      violations.push(`${indexFile} is missing`)
      continue
    }
    const indexSource = readFileSync(indexPath, 'utf8')
    if (!indexSource.includes(`useWorkspace('${workspace}')`)) {
      violations.push(`${indexFile} must own useWorkspace('${workspace}')`)
    }
    for (const field of ['collection:', 'selectedId:', 'outcome', 'select', 'clear:']) {
      if (!indexSource.includes(field)) violations.push(`${indexFile} must expose ${field}`)
    }
    for (const forbidden of ['data:', 'crud:', 'state:', 'derived:', 'actions:', 'refresh']) {
      if (indexSource.includes(forbidden)) violations.push(`${indexFile} must not expose ${forbidden}`)
    }
  }

  for (const relativeFile of DOMAIN_WORKSPACE_INDEXES) {
    if (!existsSync(path.join(repoRoot, relativeFile))) {
      violations.push(`${relativeFile} is missing its domain-owned Workspace index`)
    }
  }

  const projectWorkspaceApps = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/project/composables/workspace/capabilities/Apps/useProjectWorkspaceApps.ts'
    ),
    'utf8'
  )
  if (
    !projectWorkspaceApps.includes('useProjectWorkspaceEcosystem()') ||
    !projectWorkspaceApps.includes('entry.ecosystem_id') ||
    projectWorkspaceApps.includes('entry.project_id')
  ) {
    violations.push(
      'Project Apps must resolve through Project Ecosystems; App must not carry a Project relationship'
    )
  }

  const activeEntity = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/components/Workspace/ActiveEntity.vue'
    ),
    'utf8'
  )
  const projectActive = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Active.vue'
    ),
    'utf8'
  )
  if (
    !projectActive.includes('<UUser') ||
    !projectActive.includes('project: { name: string; tagline: string; url: string }')
  ) {
    violations.push(
      'Project Workspace Active must receive only Project index presentation state'
    )
  }
  if (activeEntity.includes('workspace-selected-entity__')) {
    violations.push(
      'WorkspaceActiveEntity must not retain selected-entity terminology'
    )
  }
  if (!activeEntity.includes('changeable?: boolean')) {
    violations.push(
      'WorkspaceActiveEntity must allow one-entity families to omit switching'
    )
  }

  const writeGuard = readFileSync(
    path.join(workspaceRoot, 'useWorkspaceWriteGuard.ts'),
    'utf8'
  )
  if (!writeGuard.includes('selectedId.value')) {
    violations.push(
      'Workspace write guard must reject writes without an active Entity id'
    )
  }
  for (const forbidden of [
    'demo',
    'WorkspaceData',
    'useWorkspaceDataAuthority',
  ]) {
    if (writeGuard.includes(forbidden)) {
      violations.push(
        `Workspace write guard must not retain ${forbidden} compatibility`
      )
    }
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ Workspace spine drift detected:',
        ...violations.map((value) => `  - ${value}`),
      ].join('\n')
    )
  }

  console.log(
    '[guard] ✅ Workspace keeps one active Entity id and domain-owned collections'
  )
}

function collectFiles(dir, files) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) collectFiles(fullPath, files)
    else if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts'))
      files.push(fullPath)
  }
}

function relative(repoRoot, file) {
  return path.relative(repoRoot, file).split(path.sep).join('/')
}
