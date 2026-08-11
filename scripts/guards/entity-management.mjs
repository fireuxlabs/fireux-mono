// @fireux-script
// last_used: 2026-08-11
// usage_note: enforces the extensible root -> Console -> App management ladder for Console entities.

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const relativeFiles = {
  contract: 'packages/core/fireux-core/src/runtime/models/utils/scope.model.ts',
  resolver: 'packages/core/fireux-core/src/runtime/utils/entity-management.ts',
  runtimeConfig: 'packages/core/fireux-core/src/runtime/composables/fireux/app/FireUXConfig.ts',
  ecosystemType: 'packages/core/fireux-core/src/types/ecosystem.ts',
  appModel: 'packages/core/fireux-core/src/runtime/models/core/app.model.ts',
  kitchen: 'packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts',
  supplier: 'packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts',
  property: 'packages/extensions/fireux-properties/src/runtime/models/property.model.ts',
  portfolio: 'packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts',
  blank: 'projects/fireux/fireux-blank/app/models/blank.model.ts',
  kitchenWriter: 'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/onboarding.ts',
  supplierWriter: 'packages/extensions/fireux-suppliers/src/runtime/server/supplier/onboarding.ts',
  propertyWriter: 'packages/extensions/fireux-properties/src/runtime/server/property/onboarding.ts',
  portfolioWriter: 'packages/extensions/fireux-properties/src/runtime/server/portfolio/onboarding.ts',
  blankWriter: 'projects/fireux/fireux-blank/server/utils/blank/onboarding.ts',
  kitchenTargetModel: 'packages/extensions/fireux-kitchens/src/runtime/models/kitchen/kitchen-index.model.ts',
  kitchenTargetApi: 'packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/targets.get.ts',
  placeAuthority: 'packages/extensions/fireux-places/src/runtime/server/place/mutation-authority.ts',
  kitchenThemeEditor: 'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Identity/useKitchenThemeEditor.ts',
  kitchenSproochliEditor: 'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Identity/Sections/Sproochli.vue',
  miseboxRules: 'packages/ecosystem/fireux-misebox/src/config/firebase/rules/app-authority.rules',
  migration: 'scripts/migrate-console-entity-management.mjs',
}

const ecosystemConfigs = [
  'bringli',
  'buenohost',
  'fireux',
  'granite',
  'misebox',
  'slap',
  'werkbox',
].map(name =>
  `packages/ecosystem/fireux-${name}/src/config/firebase/ecosystem.config.ts`
)

const read = (repoRoot, relative) =>
  readFileSync(path.join(repoRoot, relative), 'utf8')

export async function run(ctx) {
  const repoRoot = ctx?.repoRoot ?? process.cwd()
  const violations = []
  const source = Object.fromEntries(
    Object.entries(relativeFiles).map(([key, relative]) => [key, read(repoRoot, relative)])
  )

  for (const [key, model] of Object.entries(source).filter(([key]) =>
    ['kitchen', 'supplier', 'property', 'portfolio', 'blank'].includes(key)
  )) {
    if (!/management:\s*FireuxEntityManagementDefaults/.test(model)) {
      violations.push(`${relativeFiles[key]} does not seed management from the shared contract`)
    }
    if (/\.\.\.FireuxAppScope|app_scope_state\s*:|app_scope_app_id\s*:/.test(model)) {
      violations.push(`${relativeFiles[key]} still stores the retired App-scope shape`)
    }
  }

  if (!/\| \{ mode: 'root' \}[\s\S]*\| \{ mode: 'console' \}[\s\S]*\| \{ mode: 'app'; app_id: string \}/.test(source.contract)) {
    violations.push(`${relativeFiles.contract} does not define the exact three-mode management union`)
  }
  if (!/id !== resolveFireuxEcosystemAppId\(ecosystem\)[\s\S]*return \{ mode: 'console' \}/.test(source.resolver)) {
    violations.push(`${relativeFiles.resolver} does not resolve the ecosystem App to console mode`)
  }
  if (!/return `\$\{key\}-app`/.test(source.resolver)) {
    violations.push(`${relativeFiles.resolver} does not derive the ecosystem App from the ecosystem key`)
  }
  if (!/return \{ mode: 'app', app_id: id \}/.test(source.resolver)) {
    violations.push(`${relativeFiles.resolver} does not resolve dedicated Apps to app mode`)
  }
  if (/APP_CONSOLE_FAMILIES|['"](?:kitchen|property|supplier|portfolio)['"]/.test(source.appModel)) {
    violations.push(`${relativeFiles.appModel} hard-codes extension Console families`)
  }

  for (const key of ['kitchenWriter', 'supplierWriter', 'propertyWriter', 'portfolioWriter', 'blankWriter']) {
    const writer = source[key]
    if (!/management:\s*(?:(?:current|policy)\.)?management|\n\s*management,/.test(writer)) {
      violations.push(`${relativeFiles[key]} does not write the canonical management object`)
    }
    if (/app_scope_state\s*:|app_scope_app_id\s*:|app_role\s*:/.test(writer)) {
      violations.push(`${relativeFiles[key]} still writes retired management fields`)
    }
  }

  for (const relative of ecosystemConfigs) {
    if (/consoleAppId/.test(read(repoRoot, relative))) {
      violations.push(`${relative} redundantly configures a Console App id`)
    }
  }
  for (const key of ['runtimeConfig', 'ecosystemType']) {
    if (/consoleAppId/.test(source[key])) {
      violations.push(`${relativeFiles[key]} exposes the retired Console App id configuration`)
    }
  }
  if (/console-app-id|consoleAppId/.test(source.migration)) {
    violations.push(`${relativeFiles.migration} accepts a redundant Console App id`)
  }
  if (!/Ecosystem App support does not prove Console management/.test(source.migration)) {
    violations.push(`${relativeFiles.migration} infers Console management from support alone`)
  }

  if (!/management:\s*Exclude<FireuxEntityManagement, \{ mode: 'root' \}>/.test(source.kitchenTargetModel)) {
    violations.push(`${relativeFiles.kitchenTargetModel} does not preserve the exact attached-management union`)
  }
  if (!/management:\s*input\.scope\.management/.test(source.kitchenTargetApi)) {
    violations.push(`${relativeFiles.kitchenTargetApi} rewrites the canonical management DTO`)
  }
  for (const key of ['placeAuthority', 'kitchenThemeEditor', 'kitchenSproochliEditor']) {
    if (!/readFireuxEntityManagement/.test(source[key]) || /\.app_scope\b/.test(source[key])) {
      violations.push(`${relativeFiles[key]} does not consume the shared management contract`)
    }
  }
  if (
    !/data\.keys\(\)\.hasAll\(\['management'\]\)/.test(source.miseboxRules) ||
    !/data\.management\.mode == 'console'/.test(source.miseboxRules) ||
    !/data\.management\.mode == 'app'/.test(source.miseboxRules) ||
    !/\? 'misebox-app'/.test(source.miseboxRules) ||
    /resource\.data\.app_scope/.test(source.miseboxRules)
  ) {
    violations.push(`${relativeFiles.miseboxRules} does not authorize the exact management contract`)
  }

  const genericFactory = path.join(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate.ts'
  )
  if (existsSync(genericFactory)) {
    violations.push('Core still owns the retired domain-enumerating Console create factory')
  }

  if (violations.length) {
    throw new Error(
      ['[guard] ❌ entity management drift detected:', ...violations.map(v => `  - ${v}`)].join('\n')
    )
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await run({ repoRoot: process.cwd() })
}
