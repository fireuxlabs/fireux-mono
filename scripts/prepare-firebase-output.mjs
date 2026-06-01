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
packageJson.pnpm ||= {}
packageJson.pnpm.overrides ||= {}
packageJson.pnpm.overrides.tinyexec ||= '1.1.2'
packageJson.pnpm.onlyBuiltDependencies ||= []

for (const dependency of onlyBuiltDependencies) {
  if (!packageJson.pnpm.onlyBuiltDependencies.includes(dependency)) {
    packageJson.pnpm.onlyBuiltDependencies.push(dependency)
  }
}

writeFileSync(outputPackageJson, `${JSON.stringify(packageJson, null, 2)}\n`)
writeFileSync(
  outputWorkspaceYaml,
  [
    'packages:',
    "  - '.'",
    'strictDepBuilds: false',
    'overrides:',
    "  tinyexec: '1.1.2'",
    'onlyBuiltDependencies:',
    ...onlyBuiltDependencies.map((dependency) => `  - '${dependency}'`),
    '',
  ].join('\n')
)
writeFileSync(outputNpmrc, 'strict-dep-builds=false\n')
