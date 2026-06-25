// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputServerDir = join(process.cwd(), '.output/server')
const outputPackageJson = join(outputServerDir, 'package.json')
const outputWorkspaceYaml = join(outputServerDir, 'pnpm-workspace.yaml')
const outputNpmrc = join(outputServerDir, '.npmrc')
const packageJson = JSON.parse(readFileSync(outputPackageJson, 'utf8'))
const onlyBuiltDependencies = ['@firebase/util', 'protobufjs', 'vue-demi', 'better-sqlite3']
const deployOverrides = {
  '@types/node': '22.18.1',
  'form-data': '2.5.5',
  qs: '6.14.1',
  'side-channel': '1.1.0',
  tinyexec: '1.1.2',
  'which-typed-array': '1.1.19',
}

packageJson.dependencies ||= {}
packageJson.dependencies['@google-cloud/functions-framework'] ||= '^3.5.1'
packageJson.pnpm ||= {}
packageJson.pnpm.overrides ||= {}
packageJson.pnpm.onlyBuiltDependencies ||= []

for (const [name, version] of Object.entries(deployOverrides)) {
  packageJson.pnpm.overrides[name] ||= version
}

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
    ...Object.entries(deployOverrides).map(
      ([name, version]) => `  '${name}': '${version}'`
    ),
    'onlyBuiltDependencies:',
    ...onlyBuiltDependencies.map((dependency) => `  - '${dependency}'`),
    '',
  ].join('\n')
)
writeFileSync(outputNpmrc, 'strict-dep-builds=false\n')
