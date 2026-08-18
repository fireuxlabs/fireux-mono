// @fireux-script
// last_used: 2026-07-26
// usage_note: run through pnpm guard; keeps adopted like-menu operation indexes on the records-then-tools spine and locks proven collection state handling.
// FILE: scripts/guards/like-menu-family.mjs

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const MEMBERS = [
  {
    name: 'Kitchen Menus',
    index:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Menus/Index.vue',
    records:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Menus/List.vue',
    tools:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Menus/Tools.vue',
    detail:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Menus/Menu.vue',
    recordsTag: '<ConsoleKitchenOperationsMenusList',
    toolsTag: '<ConsoleKitchenOperationsMenusTools',
    inspectTag: '<ConsoleKitchenOperationsMenusWorkspaceHeader',
    updateTag: '<ConsoleKitchenOperationsMenusEditDetails',
    deleteTag: '<ConsoleKitchenOperationsMenusDelete',
    recordsLabel: 'aria-label="Menus"',
    toolsLabel: 'aria-labelledby="create-menu-title"',
  },
  {
    name: 'Kitchen Dishes',
    index:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Dishes/Index.vue',
    records:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Dishes/Read.vue',
    tools:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Dishes/Tools.vue',
    detail:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Dishes/Dish.vue',
    recordsTag: '<ConsoleKitchenOperationsDishesRead',
    toolsTag: '<ConsoleKitchenOperationsDishesTools',
    inspectTag: 'aria-label="Menu placements"',
    updateTag: '<ConsoleKitchenOperationsDishesEdit',
    deleteTag: '<ConsoleKitchenOperationsDishesDelete',
    recordsLabel: ':aria-label="catalogue.title"',
    toolsLabel: ':aria-labelledby="`create-${catalogue.singular}-title`"',
    quickLook:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Dishes/QuickLook.vue',
    quickLookTag: '<ConsoleKitchenOperationsDishesQuickLook',
    detailAction: 'Open dish',
    finance:
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Console/Operations/Dishes/Finance.vue',
    financeTag: '<ConsoleKitchenOperationsDishesFinance',
    collectionState: {
      fetch:
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/dish/fetch/useKitchenDishCollection.ts',
      controller:
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/console/operations/Dishes/useKitchenConsoleDishes.ts',
      errorTitle: ':title="`${catalogue.title} unavailable`"',
    },
  },
]

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []

  for (const member of MEMBERS) {
    validateMember(repoRoot, member, violations)
  }

  if (violations.length) {
    throw new Error(
      [
        '[guard] ❌ like-menu operation family drift detected:',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        '[guard] Fix:',
        '- Keep each adopted browse entry ordered as records → tools.',
        '- Keep records visibly grouped without forcing a redundant heading card.',
        '- Keep collection tools limited to creation.',
        '- Keep inspection, update, and delete controls on the record detail.',
        '- Preserve explicit pending, error, empty, and ready collection outcomes.',
        '- Move large creation, source-review, and QR workflows to their dedicated routes.',
        '- Register a new member only after it proves the same jobs with domain-owned content.',
      ].join('\n')
    )
  }

  console.log('[guard] ✅ like-menu operation family uses records then tools')
}

function validateMember(repoRoot, member, violations) {
  const indexSource = read(repoRoot, member.index, violations)
  const recordsSource = read(repoRoot, member.records, violations)
  const toolsSource = read(repoRoot, member.tools, violations)
  const detailSource = read(repoRoot, member.detail, violations)
  const quickLookSource = member.quickLook
    ? read(repoRoot, member.quickLook, violations)
    : ''

  if (indexSource) {
    requireText(
      indexSource,
      'v-if="kitchenId"',
      member.index,
      'browse rendering must gate on the persisted selection id, not the asynchronously hydrated Kitchen object',
      violations
    )
    const recordsPosition = indexSource.indexOf(member.recordsTag)
    const toolsPosition = indexSource.indexOf(member.toolsTag)

    if (recordsPosition < 0) {
      violations.push(`${member.index} (${member.name} records list is missing)`)
    }
    if (toolsPosition < 0) {
      violations.push(`${member.index} (${member.name} tools list is missing)`)
    }
    if (
      recordsPosition >= 0 &&
      toolsPosition >= 0 &&
      recordsPosition >= toolsPosition
    ) {
      violations.push(`${member.index} (${member.name} must render records before tools)`)
    }

    for (const forbidden of [
      '<ConsoleOperationWritePanel',
      '<ConsoleKitchenOperationsMenusCreation',
      '<ConsoleKitchenOperationsMenusQR',
    ]) {
      if (indexSource.includes(forbidden)) {
        violations.push(
          `${member.index} (large workflow ${forbidden.slice(1)} does not belong in the family entry)`
        )
      }
    }
  }

  if (recordsSource) {
    requireText(
      recordsSource,
      member.recordsLabel,
      member.records,
      'records must retain a named semantic list surface',
      violations
    )
    if (member.quickLookTag) {
      requireText(
        recordsSource,
        member.quickLookTag,
        member.records,
        'quick-look browse members must retain their read-only preview',
        violations
      )
    }
  }
  if (toolsSource) {
    requireText(
      toolsSource,
      member.toolsLabel,
      member.tools,
      'the create tool must retain a named semantic surface',
      violations
    )
    for (const forbidden of [
      'Review menu sources',
      'Guest links and QR codes',
      'deleteMenu',
      'updateMenu',
    ]) {
      if (toolsSource.includes(forbidden)) {
        violations.push(
          `${member.tools} (${forbidden} does not belong on the collection page)`
        )
      }
    }
  }
  if (detailSource) {
    for (const [tag, job] of [
      [member.inspectTag, 'inspection'],
      [member.updateTag, 'update'],
      [member.deleteTag, 'delete'],
    ]) {
      requireText(
        detailSource,
        tag,
        member.detail,
        `record detail must retain its ${job} surface`,
        violations
      )
    }
    if (member.financeTag) {
      requireText(
        detailSource,
        member.financeTag,
        member.detail,
        'record detail must retain its derived finance surface',
        violations
      )
    }
  }
  if (quickLookSource && member.detailAction) {
    requireText(
      quickLookSource,
      member.detailAction,
      member.quickLook,
      'quick look must retain an explicit child-detail action',
      violations
    )
  }

  if (member.finance) {
    const financeSource = read(repoRoot, member.finance, violations)
    for (const [expected, message] of [
      ['Cost of sales', 'finance surface must retain cost-of-sales language'],
      ['Planning estimate', 'finance surface must label derived costs as estimates'],
    ]) {
      requireText(
        financeSource,
        expected,
        member.finance,
        message,
        violations
      )
    }
    for (const forbidden of [
      'Ingredient cost breakdown',
      'Estimate, not an expense',
    ]) {
      if (financeSource.includes(forbidden)) {
        violations.push(
          `${member.finance} (${forbidden} belongs in the Kitchen Finance detail, not the compact Dish summary)`
        )
      }
    }
  }

  if (member.collectionState) {
    validateCollectionState(repoRoot, member, recordsSource, violations)
  }
}

function validateCollectionState(repoRoot, member, recordsSource, violations) {
  const fetchSource = read(
    repoRoot,
    member.collectionState.fetch,
    violations
  )
  const controllerSource = read(
    repoRoot,
    member.collectionState.controller,
    violations
  )

  if (fetchSource) {
    for (const [expected, message] of [
      [
        'useFirestoreCollectionState',
        'collection fetch must derive the canonical collection outcome',
      ],
      ['error,', 'collection fetch must expose its error'],
      ['outcome,', 'collection fetch must expose its outcome'],
    ]) {
      requireText(
        fetchSource,
        expected,
        member.collectionState.fetch,
        message,
        violations
      )
    }
    if (/collectionRef\.value\s*===\s*undefined/.test(fetchSource)) {
      violations.push(
        `${member.collectionState.fetch} (must use the Firestore pending ref instead of inferring loading from collection data)`
      )
    }
  }

  if (controllerSource) {
    for (const [expected, message] of [
      ['demoData.error.value', 'controller must preserve Demo read errors'],
      ['recordProvider:', 'controller must preserve Demo read outcomes'],
      ['error,', 'controller must preserve live read errors'],
      ['outcome,', 'controller must preserve live read outcomes'],
    ]) {
      requireText(
        controllerSource,
        expected,
        member.collectionState.controller,
        message,
        violations
      )
    }
  }

  if (recordsSource) {
    requireText(
      recordsSource,
      'v-else-if="error"',
      member.records,
      'records must render read errors before empty state',
      violations
    )
    requireText(
      recordsSource,
      member.collectionState.errorTitle,
      member.records,
      'records must retain an explicit unavailable state',
      violations
    )
  }
}

function read(repoRoot, relativePath, violations) {
  const fullPath = path.join(repoRoot, relativePath)
  if (!existsSync(fullPath)) {
    violations.push(`${relativePath} (missing)`)
    return ''
  }
  return readFileSync(fullPath, 'utf8')
}

function requireText(source, expected, filePath, message, violations) {
  if (!source.includes(expected)) {
    violations.push(`${filePath} (${message})`)
  }
}
