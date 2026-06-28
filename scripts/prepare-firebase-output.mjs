// @fireux-script
// last_used: 2026-06-28
// usage_note: baseline after scripts cleanup; update when run.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputServerDir = join(process.cwd(), '.output/server')
const outputPackageJson = join(outputServerDir, 'package.json')
const outputWorkspaceYaml = join(outputServerDir, 'pnpm-workspace.yaml')
const outputNpmrc = join(outputServerDir, '.npmrc')
const packageJson = JSON.parse(readFileSync(outputPackageJson, 'utf8'))
const onlyBuiltDependencies = ['@firebase/util', 'protobufjs', 'vue-demi', 'better-sqlite3']

packageJson.dependencies ||= {}
packageJson.dependencies['@google-cloud/functions-framework'] ||= '^3.5.1'
delete packageJson.pnpm

writeFileSync(outputPackageJson, `${JSON.stringify(packageJson, null, 2)}\n`)
writeFileSync(
  outputWorkspaceYaml,
  [
    'packages:',
    "  - '.'",
    'confirmModulesPurge: false',
    'strictDepBuilds: false',
    'onlyBuiltDependencies:',
    ...onlyBuiltDependencies.map((dependency) => `  - '${dependency}'`),
    '',
  ].join('\n')
)
writeFileSync(
  outputNpmrc,
  [
    'strict-dep-builds=false',
    'package-manager-strict=false',
    'package-manager-strict-version=false',
    '',
  ].join('\n')
)
