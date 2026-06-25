// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

const rel = (path) => join(root, path)

const checks = [
  {
    label: 'No unresolved UButtonGroup in new profile/identity switches',
    files: [
      'packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue',
      'packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue',
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/identity.vue',
    ],
    forbidden: ['UButtonGroup'],
  },
  {
    label: 'Kitchen identity uses single Edit.vue surface',
    files: [
      'packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/identity.vue',
      'packages/extensions/fireux-kitchens/src/runtime/components/console/Kitchen/Identity.vue',
      'packages/extensions/fireux-kitchens/src/runtime/components/console/Kitchen/Edit.vue',
    ],
    forbidden: [
      'ConsoleKitchenEditCore',
      'ConsoleKitchenEditApp',
      'ConsoleKitchenEditIdentity',
      'Kitchen Edit Core',
      'WRITE Identity',
      'hello world',
    ],
  },
]

const requiredFiles = [
  'packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Identity.vue',
  'packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Identity.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Identity.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/console/Kitchen/Edit.vue',
]

const removedFiles = [
  'packages/extensions/fireux-kitchens/src/runtime/components/console/Kitchen/EditCore.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/console/Kitchen/EditIdentity.vue',
  'packages/extensions/fireux-kitchens/src/runtime/components/organisms/Console/Kitchen/IdentityWrite.vue',
]

let failed = false

const fail = (message) => {
  failed = true
  console.error(`[fail] ${message}`)
}

const pass = (message) => {
  console.log(`[ok] ${message}`)
}

for (const file of requiredFiles) {
  if (existsSync(rel(file))) {
    pass(`required file exists: ${file}`)
  } else {
    fail(`missing required file: ${file}`)
  }
}

for (const file of removedFiles) {
  if (existsSync(rel(file))) {
    fail(`stale file should be removed: ${file}`)
  } else {
    pass(`stale file absent: ${file}`)
  }
}

for (const check of checks) {
  let checkFailed = false

  for (const file of check.files) {
    const path = rel(file)
    if (!existsSync(path)) {
      fail(`${check.label}: missing file ${file}`)
      checkFailed = true
      continue
    }

    const text = readFileSync(path, 'utf8')
    for (const forbidden of check.forbidden) {
      if (text.includes(forbidden)) {
        fail(`${check.label}: found "${forbidden}" in ${file}`)
        checkFailed = true
      }
    }
  }

  if (!checkFailed) pass(check.label)
}

if (failed) {
  process.exit(1)
}

const run = (args) => {
  console.log(`\n$ pnpm ${args.join(' ')}`)
  const result = spawnSync('pnpm', args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (process.argv.includes('--quick')) {
  console.log('\nQuick check passed. Skipped package builds.')
} else {
  run(['--filter', 'fireux-jobs', 'build'])
  run(['--filter', 'fireux-kitchens', 'build'])
}
