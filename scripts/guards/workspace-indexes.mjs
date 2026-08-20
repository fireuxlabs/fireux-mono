// @fireux-script
// last_used: 2026-07-27
// usage_note: keeps workspace entity indexes on the shared selected-target, typed-data, and outcome-driven presentation spine.
// FILE: scripts/guards/workspace-indexes.mjs
// Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: prevent selected-target and target-state presentation forks.
// Concurrent edit — 2026-07-21 22:38 CEST — Workspace authority alignment: lock family-owned target resolution and outcome-bound selection.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { GENERATED_DIRECTORY_NAMES } from './_lib/filesystem-policy.mjs'

const SOURCE_ROOTS = ['packages', 'projects']
const SKIP_DIRS = new Set(GENERATED_DIRECTORY_NAMES)
const INDEX_COMPONENT_RE = /\/components\/Workspace\/([^/]+)\/Index\/Index\.vue$/
const MEMBERSHIP_TARGET_FAMILIES = new Set([
  'Blank',
  'Portfolio',
  'Property',
  'Supplier',
])
const MUTATION_EFFECT_CALLS = new Set([
  '$fetch',
  'addDoc',
  'createDocument',
  'deleteDoc',
  'deleteDocument',
  'deleteObject',
  'runTransaction',
  'setDoc',
  'setDocument',
  'updateDoc',
  'updateDocument',
  'uploadBytes',
  'uploadBytesResumable',
  'uploadString',
  'writeBatch',
])
const CONSOLE_WRITE_GATE_RE =
  /^(?:requireWritableData|require[A-Z][A-Za-z0-9]*WorkspaceWrite)$/
const SOURCE_TYPE_VIEW_BRANCH_RE =
  /\bsource(?:\.value)?\s*(?:===|!==)\s*['"](?:demo|live|test)['"]|['"](?:demo|live|test)['"]\s*(?:===|!==)\s*\bsource(?:\.value)?/

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const files = []
  const violations = []

  for (const rootName of SOURCE_ROOTS) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    collectFiles(rootPath, files)
  }

  const indexComponents = files.flatMap((fullPath) => {
    const normalized = normalizePath(fullPath)
    const match = normalized.match(INDEX_COMPONENT_RE)
    return match ? [{ fullPath, family: match[1] }] : []
  })

  for (const index of indexComponents) {
    validateIndex({ ...index, files, repoRoot, violations })
  }
  validateSharedWorkspaceSource({ repoRoot, violations })
  validateWorkspaceTargetEndpoints({ repoRoot, violations })
  validateWorkspaceDataContract({ files, repoRoot, violations })
  validateSourceIgnorantViews({ files, repoRoot, violations })
  validateMutationWriteGates({ files, repoRoot, violations })
  validateSelectionHydrationGates({ files, repoRoot, violations })

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ workspace index spine drift detected:',
        ...violations
          .sort((left, right) => left.localeCompare(right))
          .map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Keep WorkspaceXIndex on the selected → targets → debug rhythm and shared useWorkspaceIndex adapter.',
        '- Render selected state through WorkspaceSelectedTarget and forward @clear="actions.clear".',
        '- Render target pending/error/ready/empty state only through WorkspaceTargetCollection.',
        '- Resolve membership target IDs and outcomes once in the family core; index adapters only consume that authority.',
        '- Bind Kitchen selection to its live/demo target items and outcome, with auto-selection left to useWorkspaceIndex.',
        '- Stamp selected-parent data at each provider boundary as { type, value }; persist and validate { id, type }.',
        '- Derive isDemo, readOnly, and canWrite from the selected typed data; missing or mismatched provenance stays read-only and inactive.',
        '- Keep operation/detail views source-ignorant and gate every mutation adapter before its first side effect.',
        '- Domain wrappers retain entity mapping, copy, cards, actions, and intentional multi-source composition.',
      ].join('\n')
    )
  }

  console.log(
    '[guard] ✅ workspace indexes, typed data, and write gates use the shared spine'
  )
}

function validateWorkspaceTargetEndpoints({ repoRoot, violations }) {
  const requestRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceTargetRequest.ts'
  const targetsRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceTargets.ts'
  const endpointRelative =
    'packages/core/fireux-core/src/runtime/server/api/workspace/[family]/targets.get.ts'
  const moduleRelative = 'packages/core/fireux-core/src/module.ts'
  const kitchenRelative =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceTargetCollection.ts'
  const friiitesRelative = 'projects/misebox/friiites/nuxt.config.ts'
  const runtimeConfigRelative =
    'packages/core/fireux-core/src/runtime/app/composables/config/FireUXConfig.ts'
  const familyRuntimeRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceFamilyRuntime.ts'
  const request = readRequiredSource(
    repoRoot,
    requestRelative,
    'missing shared authenticated Workspace target request',
    violations
  )
  const targets = readRequiredSource(
    repoRoot,
    targetsRelative,
    'missing shared Workspace target authority adapter',
    violations
  )
  const endpoint = readRequiredSource(
    repoRoot,
    endpointRelative,
    'missing canonical Workspace family target endpoint',
    violations
  )
  const moduleSource = readRequiredSource(
    repoRoot,
    moduleRelative,
    'missing Core module registration',
    violations
  )
  const kitchen = readRequiredSource(
    repoRoot,
    kitchenRelative,
    'missing Kitchen target projection adapter',
    violations
  )
  const friiites = readRequiredSource(
    repoRoot,
    friiitesRelative,
    'missing Friiites tenant Workspace policy',
    violations
  )
  const runtimeConfig = readRequiredSource(
    repoRoot,
    runtimeConfigRelative,
    'missing runtime Workspace policy projection',
    violations
  )
  const familyRuntime = readRequiredSource(
    repoRoot,
    familyRuntimeRelative,
    'missing request-scoped Workspace family runtime',
    violations
  )

  assertMatch(
    moduleSource,
    /route:\s*['"]\/api\/workspace\/:family\/targets['"]/,
    moduleRelative,
    'must register the canonical family target endpoint',
    violations
  )
  assertMatch(
    request,
    /workspace-target-request-\$\{appId\}-\$\{normalizedFamily\}[\s\S]*requestKey = `\$\{appId\}:\$\{normalizedFamily\}:\$\{requestUid\}`/,
    requestRelative,
    'request state must be isolated by App, family, and User',
    violations
  )
  for (const pattern of [
    /\/api\/workspace\/\$\{normalizedFamily\}\/targets/,
    /getIdToken\(\)/,
    /Authorization:\s*`Bearer/,
    /response\.appId !== appId/,
    /response\.family !== normalizedFamily/,
    /status:\s*'pending'/,
    /status:\s*'ready'/,
    /status:\s*'error'/,
  ]) {
    assertMatch(
      request,
      pattern,
      requestRelative,
      'must validate one authenticated canonical response',
      violations
    )
  }
  assertMatch(
    targets,
    /useWorkspaceTargetRequest\(family\)/,
    targetsRelative,
    'all generic Workspace families must consume the shared request',
    violations
  )
  for (const pattern of [
    /requireFirebaseBearerUser/,
    /project_ids/,
    /operator_ids/,
    /team_ids/,
    /Cache-Control['"]?:\s*['"]private, no-store/,
  ]) {
    assertMatch(
      endpoint,
      pattern,
      endpointRelative,
      'must retain authenticated, family-owned target authority',
      violations
    )
  }
  assertMatch(
    kitchen,
    /useWorkspaceTargetRequest<KitchenWorkspaceTargetItem>\(['"]kitchen['"]/,
    kitchenRelative,
    'Kitchen must reuse the shared request lifecycle',
    violations
  )
  assertNoMatch(
    kitchen,
    /useAsyncData|firebase\/firestore/,
    kitchenRelative,
    'Kitchen must not fork request lifecycle or browser authority',
    violations
  )
  assertMatch(
    friiites,
    /workspaceConfig:\s*\{[\s\S]*kitchen:\s*\{[\s\S]*allowDemo:\s*false/,
    friiitesRelative,
    'Friiites must disable Demo targets for its enforced live Kitchen',
    violations
  )
  assertMatch(
    runtimeConfig,
    /typeof config\.allowDemo === ['"]boolean['"][\s\S]*normalized\.allowDemo = config\.allowDemo/,
    runtimeConfigRelative,
    'runtime config must preserve the App Demo policy',
    violations
  )
  for (const pattern of [
    /useNuxtApp\(\)/,
    /Symbol\.for\(['"]fireux\.workspace-family-runtimes['"]\)/,
    /const key = `\$\{appId\}:\$\{normalizeWorkspaceFamily\(family\)\}`/,
    /registry\.set\(key, runtime\)/,
  ]) {
    assertMatch(
      familyRuntime,
      pattern,
      familyRuntimeRelative,
      'family runtime must be isolated by Nuxt App, FireUX App, and family',
      violations
    )
  }
}

function validateWorkspaceDataContract({ files, repoRoot, violations }) {
  const dataRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceData.ts'
  const selectionRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceSelection.ts'
  const runtimeRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceEntityRuntime.ts'
  const writeGuardRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceWriteGuard.ts'
  const dataAuthorityRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceDataAuthority.ts'
  const dataSource = readRequiredSource(
    repoRoot,
    dataRelative,
    'missing shared WorkspaceData envelope',
    violations
  )
  const selectionSource = readRequiredSource(
    repoRoot,
    selectionRelative,
    'missing typed Workspace selection authority',
    violations
  )
  const runtimeSource = readRequiredSource(
    repoRoot,
    runtimeRelative,
    'missing typed Workspace entity runtime',
    violations
  )
  const writeGuardSource = readRequiredSource(
    repoRoot,
    writeGuardRelative,
    'missing Workspace mutation write gate',
    violations
  )
  const dataAuthoritySource = readRequiredSource(
    repoRoot,
    dataAuthorityRelative,
    'missing resolved Workspace data authority',
    violations
  )

  if (dataSource) {
    assertMatch(
      dataSource,
      /type WorkspaceData<T> = Readonly<\{\s*type:\s*WorkspaceDataType\s*value:\s*T\s*\}>/,
      dataRelative,
      'WorkspaceData must keep provenance outside domain records as { type, value }',
      violations
    )
    assertMatch(
      dataSource,
      /return\s*\{\s*type:\s*normalizedType,\s*value,\s*\}/,
      dataRelative,
      'workspaceData must stamp the normalized type at the provider boundary',
      violations
    )
    assertNoMatch(
      dataSource,
      /\bdata_type\b/,
      dataRelative,
      'Workspace provenance must use the envelope, not mutate records with data_type',
      violations
    )
  }

  if (selectionSource) {
    assertMatch(
      selectionSource,
      /type WorkspaceSelectionState = \{[\s\S]{0,80}\bid\??:\s*string[\s\S]{0,160}\btype\??:\s*WorkspaceDataType/,
      selectionRelative,
      'persisted Workspace selection must write the canonical { id, type } shape, with legacy fields read only for migration',
      violations
    )
    assertMatch(
      selectionSource,
      /const selectedId = computed\(\(\) =>[\s\S]{0,100}normalizeString\(state\.value\?\.id(?:\s*\?\?\s*state\.value\?\.selectedId)?\)/,
      selectionRelative,
      'selected id must prefer the canonical persisted id',
      violations
    )
    assertMatch(
      selectionSource,
      /const selectedType = computed<WorkspaceDataType \| null>/,
      selectionRelative,
      'selection must normalize the persisted data type',
      violations
    )
    assertMatch(
      selectionSource,
      /commitSelection\(\{\s*id:\s*nextId,\s*type:\s*nextType,\s*\}\)/,
      selectionRelative,
      'selection writes must persist id and type together',
      violations
    )
    assertMatch(
      selectionSource,
      /getTargetId\(item\) === id[\s\S]{0,180}getTargetType\(item\) === selectedType\.value/,
      selectionRelative,
      'selected targets must match both persisted id and provider type',
      violations
    )
  }

  if (runtimeSource) {
    assertMatch(
      runtimeSource,
      /targetData:\s*ValueRef<[\s\S]{0,160}WorkspaceData<TTarget>/,
      runtimeRelative,
      'entity runtime must receive typed target envelopes',
      violations
    )
    assertMatch(
      runtimeSource,
      /getId:\s*(?:\(\s*data\s*\)|data)\s*=>\s*options\.getId\(data\.value\),\s*getType:\s*(?:\(\s*data\s*\)|data)\s*=>\s*data\.type/,
      runtimeRelative,
      'entity runtime selection must bind envelope value and type together',
      violations
    )
    assertMatch(
      runtimeSource,
      /selectedData\.value\?\.type === source\.value[\s\S]{0,100}\?\s*selectedData\.value\.type\s*:\s*null/,
      runtimeRelative,
      'source and selected-provider type mismatch must fail closed',
      violations
    )
    assertMatch(
      runtimeSource,
      /active:\s*computed\(\(\) => Boolean\(dataType\.value\)\)/,
      runtimeRelative,
      'missing typed data must deactivate storage',
      violations
    )
    assertMatch(
      runtimeSource,
      /useWorkspaceDataAuthority\(options\.family\)[\s\S]{0,360}setAuthority\(id,\s*type\)/,
      runtimeRelative,
      'entity runtime must publish only its resolved selected { id, type } authority',
      violations
    )
    assertMatch(
      runtimeSource,
      /!dataType\.value[\s\S]{0,100}isDemo\.value/,
      runtimeRelative,
      'readOnly must derive from missing or Demo typed data',
      violations
    )
    assertMatch(
      runtimeSource,
      /!readOnly\.value[\s\S]{0,120}targetHasOperator/,
      runtimeRelative,
      'canWrite must derive from typed-data readOnly state and operator authority',
      violations
    )
  }

  if (writeGuardSource) {
    assertMatch(
      writeGuardSource,
      /const type = selectedType\.value[\s\S]{0,180}!type[\s\S]{0,100}type === ['"]demo['"][\s\S]{0,180}type !== expectedType/,
      writeGuardRelative,
      'write gate must reject missing, Demo, and mismatched selected data types',
      violations
    )
    assertMatch(
      writeGuardSource,
      /resolved\.id === selection\.selectedId\.value[\s\S]{0,100}resolved\.type === selection\.selectedType\.value/,
      writeGuardRelative,
      'write gate must require resolved provider authority to match the persisted selection',
      violations
    )
  }

  if (dataAuthoritySource) {
    assertMatch(
      dataAuthoritySource,
      /type WorkspaceDataAuthority = Readonly<\{\s*id:\s*string\s*type:\s*WorkspaceDataType\s*\}>/,
      dataAuthorityRelative,
      'resolved data authority must retain the exact selected { id, type } pair',
      violations
    )
    assertMatch(
      dataAuthoritySource,
      /state\.value =[\s\S]{0,160}nextId && nextType[\s\S]{0,120}\?\s*\{[\s\S]{0,80}id:\s*nextId,[\s\S]{0,80}type:\s*nextType,[\s\S]{0,80}\}\s*:\s*null/,
      dataAuthorityRelative,
      'missing provider id or type must clear data authority',
      violations
    )
  }

  for (const fullPath of files) {
    const relative = relativePath(repoRoot, fullPath)
    if (
      !/\/composables\/fireux\/workspace\/([^/]+)\/core\/use[A-Z][A-Za-z0-9]*Workspace\.ts$/.test(
        relative
      )
    ) {
      continue
    }

    const source = readFileSync(fullPath, 'utf8')
    if (!/\bworkspaceData\s*\(/.test(source)) {
      violations.push(
        `${relative} (Workspace core must stamp each selected-parent provider with workspaceData(type, value))`
      )
      continue
    }
    assertNoMatch(
      source,
      /workspaceData\(\s*workspaceRoot\.source(?:\.value)?\s*,/,
      relative,
      'provider provenance must not be copied from chooser state',
      violations
    )
    if (/\buse[A-Z][A-Za-z0-9]*WorkspaceDemoData\s*\(/.test(source)) {
      assertMatch(
        source,
        /workspaceData\(\s*(?:['"]demo['"]|type)\s*,/,
        relative,
        'Demo target providers must stamp Demo explicitly',
        violations
      )
    }
  }
}

function validateSourceIgnorantViews({ files, repoRoot, violations }) {
  for (const fullPath of files) {
    if (!fullPath.endsWith('.vue')) continue

    const relative = relativePath(repoRoot, fullPath)
    if (
      !relative.includes('/components/Workspace/') &&
      !relative.includes('/pages/workspace/')
    ) {
      continue
    }
    if (
      /\/components\/Workspace\/[^/]+\/Index\//.test(relative) ||
      /\/src\/runtime\/[^/]+\/components\/Workspace\/Index\//.test(relative)
    ) {
      continue
    }

    const source = readFileSync(fullPath, 'utf8')
    const branch = source.match(SOURCE_TYPE_VIEW_BRANCH_RE)
    if (!branch) continue

    violations.push(
      `${relative} (${branch[0]} branches a Workspace view on chooser state; consume data-derived isDemo, readOnly, or canWrite instead)`
    )
  }
}

function validateMutationWriteGates({ files, repoRoot, violations }) {
  for (const fullPath of files) {
    if (!fullPath.endsWith('.ts')) continue

    const relative = relativePath(repoRoot, fullPath)
    if (
      !relative.includes('/composables/fireux/workspace/') ||
      !relative.includes('/mutations/')
    ) {
      continue
    }

    const source = readFileSync(fullPath, 'utf8')
    const sourceFile = ts.createSourceFile(
      relative,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    )
    const calls = collectCallExpressions(sourceFile)
    const gates = calls.filter((call) =>
      CONSOLE_WRITE_GATE_RE.test(callExpressionName(call))
    )

    for (const effect of calls.filter((call) =>
      MUTATION_EFFECT_CALLS.has(callExpressionName(call))
    )) {
      if (hasPriorGateInAction(effect, gates)) continue

      const position = sourceFile.getLineAndCharacterOfPosition(
        effect.getStart(sourceFile)
      )
      violations.push(
        `${relative}:${position.line + 1} (${callExpressionName(effect)} issues a side effect before a Workspace data write gate)`
      )
    }
  }
}

function validateSharedWorkspaceSource({ repoRoot, violations }) {
  const relative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspace.ts'
  const selectionRelative =
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceSelection.ts'
  const fullPath = path.join(repoRoot, relative)
  if (!existsSync(fullPath)) {
    violations.push(`${relative} (missing shared Workspace source authority)`)
    return
  }

  const source = readFileSync(fullPath, 'utf8')
  const selectionSource = readRequiredSource(
    repoRoot,
    selectionRelative,
    'missing shared Workspace selection authority',
    violations
  )
  assertMatch(
    source,
    /useState<WorkspaceSource>\(\s*`fireux-workspace-\$\{appScope\}-\$\{normalizedFamily\}-source-state`/,
    relative,
    'Workspace source must use one App-and-family-keyed reactive state across composable instances',
    violations
  )
  assertMatch(
    source,
    /sourceState\.value = nextSource\s*sourceCookie\.value = nextSource/,
    relative,
    'Workspace source changes must update shared reactive state and its persistence cookie together',
    violations
  )
  assertMatch(
    selectionSource,
    /`fireux-workspace-\$\{appScope\}-\$\{normalizedFamily\}-selection-state`/,
    selectionRelative,
    'Workspace selection must be isolated by App and family',
    violations
  )
  assertMatch(
    selectionSource,
    /state\.value = value\s*stateCookie\.value = value/,
    selectionRelative,
    'Workspace selection must commit reactive state and persistence together',
    violations
  )
}

function validateSelectionHydrationGates({ files, repoRoot, violations }) {
  for (const fullPath of files) {
    if (!fullPath.endsWith('.vue')) continue

    const normalized = normalizePath(fullPath)
    if (
      !normalized.includes('/components/Workspace/') &&
      !normalized.includes('/pages/workspace/')
    ) {
      continue
    }

    const source = readFileSync(fullPath, 'utf8')
    const objectGate = source.match(/\bv-if=["']!selected[A-Z][A-Za-z]+["']/)
    if (!objectGate) continue

    violations.push(
      `${relativePath(repoRoot, fullPath)} (${objectGate[0]} mistakes asynchronous target hydration for no persisted selection; gate the empty state on the family selection id and render loading separately)`
    )
  }
}

function validateIndex({ fullPath, family, files, repoRoot, violations }) {
  const relative = relativePath(repoRoot, fullPath)
  const indexDir = path.dirname(fullPath)
  const source = readFileSync(fullPath, 'utf8')
  const selectedPath = path.join(indexDir, 'Selected.vue')
  const targetsPath = path.join(indexDir, 'Targets.vue')
  const selectedTag = readSelfClosingTag(
    source,
    `Workspace${family}IndexSelected`
  )
  const targetsTag = readSelfClosingTag(source, `Workspace${family}IndexTargets`)
  const debugTag = readSelfClosingTag(source, 'DevDebugPanel')

  assertMatch(
    source,
    /class=["']workspace-surface workspace-surface--compact["']/,
    relative,
    'index must use the compact shared workspace surface',
    violations
  )
  if (!selectedTag) {
    violations.push(`${relative} (missing Workspace${family}IndexSelected)`)
  } else if (!/@clear=["']actions\.clear["']/.test(selectedTag)) {
    violations.push(
      `${relative} (selected wrapper must forward @clear="actions.clear")`
    )
  }
  if (!targetsTag) {
    violations.push(`${relative} (missing Workspace${family}IndexTargets)`)
  } else {
    assertMatch(
      targetsTag,
      /:collection=["']sections\.targets\.collection["']/,
      relative,
      'targets wrapper must receive sections.targets.collection',
      violations
    )
    assertMatch(
      targetsTag,
      /:outcome=["']sections\.targets\.outcome["']/,
      relative,
      'targets wrapper must receive sections.targets.outcome',
      violations
    )
    assertMatch(
      targetsTag,
      /@select=["']actions\.selectTarget["']/,
      relative,
      'targets wrapper must forward actions.selectTarget',
      violations
    )
  }
  if (!debugTag) {
    violations.push(`${relative} (missing DevDebugPanel)`)
  } else {
    assertMatch(
      debugTag,
      /:derived=["']debug["']/,
      relative,
      'debug panel must receive the index debug state',
      violations
    )
  }
  const selectedPosition = source.indexOf(`<Workspace${family}IndexSelected`)
  const targetsPosition = source.indexOf(`<Workspace${family}IndexTargets`)
  const debugPosition = source.indexOf('<DevDebugPanel')
  if (
    selectedPosition >= 0 &&
    targetsPosition >= 0 &&
    debugPosition >= 0 &&
    !(selectedPosition < targetsPosition && targetsPosition < debugPosition)
  ) {
    violations.push(
      `${relative} (index order must be selected → targets → debug)`
    )
  }
  assertMatch(
    source,
    new RegExp(`\\buse${family}WorkspaceIndex\\s*\\(`),
    relative,
    `index must call use${family}WorkspaceIndex`,
    violations
  )

  validateSelected({ selectedPath, family, repoRoot, violations })
  validateTargets({
    targetsPath,
    indexDir,
    family,
    files,
    repoRoot,
    violations,
  })
  validateComposable({ family, files, repoRoot, violations })
  validateTargetAuthority({ family, files, repoRoot, violations })
}

function validateSelected({ selectedPath, family, repoRoot, violations }) {
  const relative = relativePath(repoRoot, selectedPath)
  if (!existsSync(selectedPath)) {
    violations.push(`${relative} (missing selected-target wrapper)`)
    return
  }

  const source = readFileSync(selectedPath, 'utf8')
  assertMatch(
    source,
    /<WorkspaceSelectedTarget\b/,
    relative,
    'selected wrapper must use WorkspaceSelectedTarget',
    violations
  )
  assertMatch(
    source,
    /@clear=["']emit\(['"]clear['"]\)["']/,
    relative,
    'selected wrapper must emit clear from WorkspaceSelectedTarget',
    violations
  )
  assertMatch(
    source,
    new RegExp(`label=["']${escapeRegex(family)}["']`),
    relative,
    `selected wrapper must identify ${family}`,
    violations
  )
}

function validateTargets({
  targetsPath,
  indexDir,
  family,
  files,
  repoRoot,
  violations,
}) {
  const relative = relativePath(repoRoot, targetsPath)
  if (!existsSync(targetsPath)) {
    violations.push(`${relative} (missing targets wrapper)`)
    return
  }

  const targetPresentationFiles = files.filter(
    (candidate) =>
      candidate.endsWith('.vue') &&
      candidate.startsWith(`${indexDir}${path.sep}`)
  )
  const combinedSource = targetPresentationFiles
    .map((candidate) => readFileSync(candidate, 'utf8'))
    .join('\n')
  const targetsSource = readFileSync(targetsPath, 'utf8')

  assertMatch(
    combinedSource,
    /<WorkspaceTargetCollection\b/,
    relative,
    'target presentation must delegate state chrome to WorkspaceTargetCollection',
    violations
  )
  if (family === 'Kitchen') {
    assertMatch(
      combinedSource,
      /<WorkspaceTargetCard\b/,
      relative,
      'Kitchen target presentation must use the dedicated Workspace target card',
      violations
    )
    if (/<KitchenCardsCell\b/.test(combinedSource)) {
      violations.push(
        `${relative} (Kitchen Workspace target selection must not nest the public Kitchen card family)`
      )
    }
  }
  if (/<MoleculesStateCard\b/.test(targetsSource)) {
    violations.push(
      `${relative} (targets wrapper must not replace authoritative outcome state with a local state card)`
    )
  }
}

function validateComposable({ family, files, repoRoot, violations }) {
  const filename = `use${family}WorkspaceIndex.ts`
  const candidates = files.filter(
    (candidate) => path.basename(candidate) === filename
  )
  if (!candidates.length) {
    violations.push(`${filename} (missing workspace index adapter)`)
    return
  }

  for (const candidate of candidates) {
    const source = readFileSync(candidate, 'utf8')
    if (/\buseWorkspaceIndex\s*\(\s*\{/.test(source)) continue
    violations.push(
      `${relativePath(repoRoot, candidate)} (workspace index adapter must delegate to useWorkspaceIndex)`
    )
  }

  if (family === 'Kitchen') {
    for (const candidate of candidates) {
      const source = readFileSync(candidate, 'utf8')
      const relative = relativePath(repoRoot, candidate)
      if (
        /kitchenId:\s*workspaceSelection\.hasSelection/.test(source) ||
        /showTargetChooser[\s\S]*workspaceSelection\.hasSelection/.test(source)
      ) {
        violations.push(
          `${relative} (persisted Kitchen selection and chooser visibility must not depend on hydrated selected-object state)`
        )
      }
      assertMatch(
        source,
        /const showTargetChooser = computed\(\s*\(\) => true\s*\)/,
        relative,
        'Kitchen selector must keep the authoritative target collection visible',
        violations
      )
      assertMatch(
        source,
        /demoTargets:\s*\{\s*show:\s*workspaceRuntime\.allowDemo\.value\s*&&\s*index\.sections\.value\.targets\.show/,
        relative,
        'Kitchen Demo chooser visibility must follow the shared Live chooser',
        violations
      )
    }
  }
}

function validateTargetAuthority({ family, files, repoRoot, violations }) {
  const coreFilename = `use${family}Workspace.ts`
  const indexFilename = `use${family}WorkspaceIndex.ts`
  const familySegment = `/workspace/${family.toLowerCase()}/`
  const coreCandidates = files.filter((candidate) => {
    const normalized = normalizePath(candidate)
    return (
      path.basename(candidate) === coreFilename &&
      normalized.includes(`${familySegment}core/`)
    )
  })
  const indexCandidates = files.filter((candidate) => {
    const normalized = normalizePath(candidate)
    return (
      path.basename(candidate) === indexFilename &&
      normalized.includes(`${familySegment}index/`)
    )
  })

  if (coreCandidates.length !== 1) {
    violations.push(
      `${coreFilename} (expected exactly one family core; found ${coreCandidates.length})`
    )
    return
  }
  if (indexCandidates.length !== 1) {
    violations.push(
      `${indexFilename} (expected exactly one family index adapter; found ${indexCandidates.length})`
    )
    return
  }

  const corePath = coreCandidates[0]
  const indexPath = indexCandidates[0]
  const coreRelative = relativePath(repoRoot, corePath)
  const indexRelative = relativePath(repoRoot, indexPath)
  const coreSource = readFileSync(corePath, 'utf8')
  const indexSource = readFileSync(indexPath, 'utf8')

  assertNoIndexTargetResolver(indexSource, indexRelative, violations)
  assertMatch(
    coreSource,
    new RegExp(
      `return useWorkspaceFamilyRuntime\\(['"]${family.toLowerCase()}['"],\\s*create${family}Workspace\\)`
    ),
    coreRelative,
    'family core must expose one request-scoped runtime',
    violations
  )

  if (MEMBERSHIP_TARGET_FAMILIES.has(family)) {
    if (findCallSources(coreSource, 'useWorkspaceTargets').length !== 1) {
      violations.push(
        `${coreRelative} (family core must own exactly one useWorkspaceTargets resolver)`
      )
    }
    assertMatch(
      coreSource,
      new RegExp(
        `useWorkspaceTargets\\s*\\(\\s*\\{\\s*family:\\s*['\"]${family.toLowerCase()}['\"]`
      ),
      coreRelative,
      `family core must resolve ${family} target IDs`,
      violations
    )
    assertMatch(
      coreSource,
      /workspaceTargets\.resolveOutcome\s*\(/,
      coreRelative,
      'family core must compose membership state into its target outcome',
      violations
    )
    assertMatch(
      coreSource,
      family === 'Blank'
        ? /useBlankCollection\s*\(\s*\{[\s\S]*source:\s*workspaceRoot\.source/
        : /operatorId:\s*(?:userId|normalizedUid)\.value/,
      coreRelative,
      family === 'Blank'
        ? 'Blank collection must resolve target access from App support'
        : 'family collection filter must query App-support operator authority',
      violations
    )
    assertMatch(
      coreSource,
      /\btargetOutcome(?:\s*:\s*[A-Za-z][A-Za-z0-9_]*|\s*,)/,
      coreRelative,
      'family selection runtime must receive the authoritative target outcome',
      violations
    )
    assertMatch(
      coreSource,
      /targeting:\s*workspaceTargets/,
      coreRelative,
      'family core must expose its one target authority to the index adapter',
      violations
    )
    assertMatch(
      coreSource,
      /enforcedTargetId:\s*workspaceTargets\.singleTargetId/,
      coreRelative,
      'family runtime must commit authority-proven single targets',
      violations
    )
    assertNoMatch(
      indexSource,
      /\bautoSelectTargetId\b/,
      indexRelative,
      'index adapter must not create a second selection authority',
      violations
    )
    return
  }

  if (family !== 'Kitchen') {
    const runtimeCalls = findCallSources(coreSource, 'useWorkspaceEntityRuntime')
    if (runtimeCalls.length !== 1) {
      violations.push(
        `${coreRelative} (family core must create exactly one outcome-bound entity runtime)`
      )
    } else {
      assertMatch(
        runtimeCalls[0],
        /\btargetOutcome(?:\s*:\s*[A-Za-z][A-Za-z0-9_]*|\s*,)/,
        coreRelative,
        'family core must bind selection to its authoritative target outcome',
        violations
      )
      assertMatch(
        runtimeCalls[0],
        /enforcedTargetId:\s*workspaceTargets\.singleTargetId/,
        coreRelative,
        'family runtime must commit authority-proven single targets',
        violations
      )
    }
    return
  }

  if (
    findCallSources(coreSource, 'useKitchenWorkspaceTargetCollection').length !==
    1
  ) {
    violations.push(
      `${coreRelative} (Kitchen core must own exactly one authenticated live target collection)`
    )
  }
  assertMatch(
    coreSource,
    /targets:\s*liveTargetCollection/,
    coreRelative,
    'Kitchen core must expose the authenticated target collection it owns',
    violations
  )
  assertNoMatch(
    indexSource,
    /useKitchenWorkspaceTargetCollection\s*\(/,
    indexRelative,
    'Kitchen index must consume, not recreate, the core target collection',
    violations
  )
  assertMatch(
    indexSource,
    /useKitchenWorkspace\(\)/,
    indexRelative,
    'Kitchen index must consume the shared family runtime',
    violations
  )
  assertMatch(
    coreSource,
    /useKitchenWorkspaceTargetCollection\(\{\s*enabled:\s*true,\s*\}\)/,
    coreRelative,
    'Kitchen family runtime must own one continuously available authoritative target collection',
    violations
  )

  const selectionCalls = findCallSources(coreSource, 'useWorkspaceSelection')
  if (selectionCalls.length !== 1) {
    violations.push(
      `${coreRelative} (Kitchen core must create exactly one outcome-bound workspace selection)`
    )
  } else {
    assertMatch(
      selectionCalls[0],
      /targetItems:\s*selectionTargets/,
      coreRelative,
      'Kitchen selection must receive source-aware target items',
      violations
    )
    assertMatch(
      selectionCalls[0],
      /targetOutcome:\s*selectionOutcome/,
      coreRelative,
      'Kitchen selection must receive the source-aware target outcome',
      violations
    )
    assertMatch(
      selectionCalls[0],
      /enforcedTargetId/,
      coreRelative,
      'tenant single-target policy must commit through shared selection',
      violations
    )
  }
  assertNoMatch(
    indexSource,
    /\bautoSelectTargetId\b/,
    indexRelative,
    'Kitchen index must not create a second auto-selection authority',
    violations
  )
  for (const watchSource of findCallSources(coreSource, 'watch')) {
    assertNoMatch(
      watchSource,
      /\b(?:selectKitchen|selectTarget)\s*\(/,
      coreRelative,
      'Kitchen core must not add a second auto-selection watch',
      violations
    )
  }
}

function assertNoIndexTargetResolver(source, relative, violations) {
  assertNoMatch(
    source,
    /\buseWorkspaceTargets\s*\(/,
    relative,
    'index adapter must not duplicate the family core target resolver',
    violations
  )
  assertNoMatch(
    source,
    /\.resolveOutcome\s*\(/,
    relative,
    'index adapter must not overlay another target outcome',
    violations
  )
}

function findCallSources(source, callee) {
  const calls = []
  const pattern = new RegExp(
    `\\b${escapeRegex(callee)}(?:\\s*<[^;{}()]*>)?\\s*\\(`,
    'g'
  )
  let match

  while ((match = pattern.exec(source))) {
    const open = source.indexOf('(', match.index)
    const close = findMatchingParenthesis(source, open)
    if (close === -1) break
    calls.push(source.slice(match.index, close + 1))
    pattern.lastIndex = close + 1
  }

  return calls
}

function findMatchingParenthesis(source, open) {
  let depth = 0
  let quote = ''
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = open; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (lineComment) {
      if (char === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false
        index += 1
      }
      continue
    }
    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) quote = ''
      continue
    }
    if (char === '/' && next === '/') {
      lineComment = true
      index += 1
      continue
    }
    if (char === '/' && next === '*') {
      blockComment = true
      index += 1
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === '(') depth += 1
    if (char !== ')') continue
    depth -= 1
    if (depth === 0) return index
  }

  return -1
}

function readSelfClosingTag(source, componentName) {
  return (
    source.match(
      new RegExp(`<${escapeRegex(componentName)}\\b[\\s\\S]*?\\/>`)
    )?.[0] ?? ''
  )
}

function readRequiredSource(repoRoot, relative, missingMessage, violations) {
  const fullPath = path.join(repoRoot, relative)
  if (!existsSync(fullPath)) {
    violations.push(`${relative} (${missingMessage})`)
    return ''
  }
  return readFileSync(fullPath, 'utf8')
}

function collectCallExpressions(sourceFile) {
  const calls = []
  const visit = (node) => {
    if (ts.isCallExpression(node)) calls.push(node)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return calls
}

function callExpressionName(call) {
  const expression = call.expression
  if (ts.isIdentifier(expression)) return expression.text
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text
  return ''
}

function nearestFunctionLike(node) {
  let current = node.parent
  while (current) {
    if (ts.isFunctionLike(current)) return current
    current = current.parent
  }
  return null
}

function hasPriorGateInAction(effect, gates) {
  let scope = nearestFunctionLike(effect)

  while (scope) {
    if (
      gates.some(
        (gate) =>
          gate.getStart() < effect.getStart() &&
          nearestFunctionLike(gate) === scope
      )
    ) {
      return true
    }
    scope = nearestFunctionLike(scope)
  }

  return false
}

function assertMatch(source, pattern, relative, message, violations) {
  if (!pattern.test(source)) violations.push(`${relative} (${message})`)
}

function assertNoMatch(source, pattern, relative, message, violations) {
  if (pattern.test(source)) violations.push(`${relative} (${message})`)
}

function collectFiles(dir, files) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue

    const fullPath = path.join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      collectFiles(fullPath, files)
      continue
    }
    if (fullPath.endsWith('.vue') || fullPath.endsWith('.ts'))
      files.push(fullPath)
  }
}

function relativePath(repoRoot, fullPath) {
  return normalizePath(path.relative(repoRoot, fullPath))
}

function normalizePath(value) {
  return value.split(path.sep).join('/')
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
