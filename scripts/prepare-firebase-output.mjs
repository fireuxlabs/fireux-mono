// @fireux-script
// last_used: 2026-07-23
// usage_note: prepare isolated Firebase SSR dependencies with pnpm 11 build approvals.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outputServerDir = join(process.cwd(), '.output/server')
const outputPackageJson = join(outputServerDir, 'package.json')
const outputWorkspaceYaml = join(outputServerDir, 'pnpm-workspace.yaml')
const outputNpmrc = join(outputServerDir, '.npmrc')
const runtimeEnvManifest = join(process.cwd(), 'server/firebase.runtime-env.json')
const packageJson = JSON.parse(readFileSync(outputPackageJson, 'utf8'))
const allowedBuildDependencies = ['@firebase/util', 'protobufjs', 'vue-demi', 'better-sqlite3']

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
    'allowBuilds:',
    ...allowedBuildDependencies.map((dependency) => `  '${dependency}': true`),
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

if (existsSync(runtimeEnvManifest)) {
  const manifest = JSON.parse(readFileSync(runtimeEnvManifest, 'utf8'))
  const projectId = String(manifest?.projectId || '').trim()
  const environment = manifest?.environment
  if (
    !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId) ||
    !environment ||
    typeof environment !== 'object' ||
    Array.isArray(environment)
  ) {
    throw new Error(
      'server/firebase.runtime-env.json must contain a valid projectId and environment object.'
    )
  }

  const lines = Object.entries(environment)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, rawValue]) => {
      const value = typeof rawValue === 'string' ? rawValue.trim() : ''
      if (
        !/^[A-Z][A-Z0-9_]+$/.test(key) ||
        /(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|CREDENTIAL|API_KEY)/.test(key) ||
        !value ||
        value.includes('\n') ||
        value.includes('\r') ||
        value.includes("'")
      ) {
        throw new Error(
          `server/firebase.runtime-env.json contains an unsafe source-controlled entry: ${key}`
        )
      }
      return `${key}='${value}'`
    })

  writeFileSync(
    join(outputServerDir, `.env.${projectId}`),
    `${lines.join('\n')}\n`
  )
  console.log(
    `[firebase-output] wrote ${lines.length} non-secret runtime environment entries for ${projectId}`
  )
}
