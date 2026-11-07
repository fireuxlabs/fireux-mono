import { readdirSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const require = createRequire(
  new URL('../../packages/core/fireux-core/package.json', import.meta.url)
)
const { createJiti } = require('jiti')
const validator = createJiti(import.meta.url).import(
  fileURLToPath(
    new URL(
      '../../packages/core/fireux-core/src/runtime/app/server/onboarding/brand-assets.ts',
      import.meta.url
    )
  )
)

export function assetAppDirectories(root = repoRoot) {
  const projects = join(root, 'projects')
  return readdirSync(projects, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((family) => {
      const directory = join(projects, family.name)
      return readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(directory, entry.name))
        .filter(
          (app) =>
            existsSync(join(app, 'package.json')) &&
            existsSync(join(app, 'nuxt.config.ts'))
        )
    })
    .sort()
}

export async function runAssetCheck(
  args = [],
  root = repoRoot,
  report = console.log
) {
  if (args.length > 1) throw new Error('Use check:assets [App-directory].')
  const apps = assetAppDirectories(root)
  const selected = args.length ? [resolve(root, args[0])] : apps
  if (selected.some((app) => !apps.includes(app)))
    throw new Error('Choose a Nuxt App directory from this workspace.')
  if (!selected.length) throw new Error('No Nuxt Apps found.')

  const { inspectAppBrandAssets } = await validator
  let passed = 0,
    total = 0
  for (const app of selected) {
    const checks = await inspectAppBrandAssets(join(app, 'public'))
    total += checks.length
    passed += checks.filter((check) => check.ok).length
    for (const check of checks.filter((check) => !check.ok))
      report(`${relative(root, app)}/${check.path}: ${check.reason}`)
  }
  report(
    `App assets: ${passed}/${total} checks passed across ${selected.length} Apps.`
  )
  return passed === total ? 0 : 1
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  runAssetCheck(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code
    })
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
