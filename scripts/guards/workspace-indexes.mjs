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
const DOMAIN_WORKSPACES = [
  [
    'project',
    'packages/core/fireux-core/src/runtime/project/composables/workspace/core/useProjectWorkspace.ts',
  ],
  [
    'kitchen',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspace.ts',
  ],
  [
    'portfolio',
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/core/usePortfolioWorkspace.ts',
  ],
  [
    'property',
    'packages/extensions/fireux-properties/src/runtime/property/composables/workspace/core/usePropertyWorkspace.ts',
  ],
  [
    'supplier',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/core/useSupplierWorkspace.ts',
  ],
  [
    'blank',
    'projects/fireux/fireux-blank/app/composables/fireux/workspace/blank/core/useBlankWorkspace.ts',
  ],
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

  const workspaceSource = readFileSync(
    path.join(workspaceRoot, 'useWorkspace.ts'),
    'utf8'
  )
  for (const required of ['activeId', 'activate', 'clearActive']) {
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
  }

  for (const [workspace, relativeFile] of DOMAIN_WORKSPACES) {
    const fullPath = path.join(repoRoot, relativeFile)
    if (!existsSync(fullPath)) {
      violations.push(`${relativeFile} is missing`)
      continue
    }
    const source = readFileSync(fullPath, 'utf8')
    if (!source.includes(`useWorkspace('${workspace}')`)) {
      violations.push(
        `${relativeFile} must select its named entity through useWorkspace('${workspace}')`
      )
    }
  }

  const kitchenWorkspace = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/core/useKitchenWorkspace.ts'
    ),
    'utf8'
  )
  const kitchenWorkspaceIndex = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex.ts'
    ),
    'utf8'
  )
  const kitchenWorkspaceActive = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Active.vue'
    ),
    'utf8'
  )
  const projectWorkspaceIndex = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/project/composables/workspace/index/useProjectWorkspaceIndex.ts'
    ),
    'utf8'
  )
  const portfolioWorkspaceIndex = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-properties/src/runtime/portfolio/composables/workspace/index/usePortfolioWorkspaceIndex.ts'
    ),
    'utf8'
  )
  const propertyWorkspaceIndex = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-properties/src/runtime/property/composables/workspace/index/usePropertyWorkspaceIndex.ts'
    ),
    'utf8'
  )
  const supplierWorkspaceIndex = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/index/useSupplierWorkspaceIndex.ts'
    ),
    'utf8'
  )
  const projectWorkspaceSelector = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/project/components/Workspace/Selector.vue'
    ),
    'utf8'
  )
  const kitchenWorkspaceSelector = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Selector.vue'
    ),
    'utf8'
  )
  if (
    !kitchenWorkspaceIndex.includes('identity?.image_url') ||
    kitchenWorkspaceIndex.includes('readKitchenPresentationIdentity')
  ) {
    violations.push(
      'Kitchen Workspace index must read canonical identity.image_url directly'
    )
  }
  if (
    !kitchenWorkspaceIndex.includes('resolveWorkspaceCanCreate(') ||
    !kitchenWorkspaceIndex.includes("'kitchen'")
  ) {
    violations.push(
      'Kitchen Workspace creation must follow the shared App workspace policy'
    )
  }
  if (
    !kitchenWorkspaceIndex.includes('actions: { refresh }') ||
    !kitchenWorkspaceActive.includes("KitchenWorkspaceIndexState['kitchen']")
  ) {
    violations.push(
      'Kitchen Workspace index must expose state and derived while Active receives only Kitchen presentation state'
    )
  }
  for (const [label, source, currentReader] of [
    ['Project', projectWorkspaceIndex, 'useProjectDetail(primaryProjectId)'],
    [
      'Kitchen',
      kitchenWorkspaceIndex,
      'useKitchenWorkspaceCurrent(primaryKitchenId)',
    ],
    [
      'Portfolio',
      portfolioWorkspaceIndex,
      "'/api/workspace/portfolio/primary'",
    ],
    ['Property', propertyWorkspaceIndex, "'/api/workspace/property/primary'"],
    ['Supplier', supplierWorkspaceIndex, "'/api/workspace/supplier/primary'"],
  ]) {
    if (
      !source.includes('useCurrentAppContext()') ||
      !source.includes(currentReader) ||
      source.includes(`use${label}Workspace()`)
    ) {
      violations.push(
        `${label} Workspace index must reuse AppUser context and read only its primary Entity`
      )
    }
  }
  if (
    !projectWorkspaceSelector.includes('useProjectCollection({') ||
    !projectWorkspaceSelector.includes('props.canSelectMultiple') ||
    !projectWorkspaceSelector.includes('props.projectIds.length > 1') ||
    !kitchenWorkspaceSelector.includes('useKitchenWorkspaceChoices(') ||
    !kitchenWorkspaceSelector.includes('props.canSelectMultiple') ||
    !kitchenWorkspaceSelector.includes('props.hasMultipleKitchens')
  ) {
    violations.push(
      'Project and Kitchen choices must stay deferred until Business selection or a non-Business primary-change request needs them'
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
    !projectActive.includes("ProjectWorkspaceIndexState['project']")
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
  if (!writeGuard.includes('activeId.value')) {
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
