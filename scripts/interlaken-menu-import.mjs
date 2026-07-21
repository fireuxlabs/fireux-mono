#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-21
// usage_note: dry-run and explicitly publish reviewed Interlaken transparent images to canonical Misebox Dish records.
// Concurrent edit — 2026-07-21 23:59 CEST — Interlaken Pizza images: add the fixed-target, images-only publication entrypoint.

import path from 'node:path'
import process from 'node:process'

import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import {
  applyInterlakenImagePlan,
} from './_lib/interlaken-pizza-image-apply.mjs'
import { writeInterlakenImagePreimage } from './_lib/interlaken-pizza-image-preimage.mjs'
import {
  buildInterlakenImagePlan,
  interlakenImagePlanOutput,
} from './_lib/interlaken-pizza-image-plan.mjs'
import {
  INTERLAKEN_PIZZA_DEFAULT_MANIFEST,
  INTERLAKEN_PIZZA_OUTPUT_ROOT,
  INTERLAKEN_PIZZA_TARGET,
} from './_lib/interlaken-pizza-target.mjs'

const OPERATION = 'interlaken-dish-images'
const CONFIRMATION = `${INTERLAKEN_PIZZA_TARGET.projectId}/${INTERLAKEN_PIZZA_TARGET.databaseId}/${INTERLAKEN_PIZZA_TARGET.appId}/${INTERLAKEN_PIZZA_TARGET.kitchenId}/dish-images`
const ALLOWED_ARGS = new Set([
  'actor',
  'apply',
  'backup',
  'confirm',
  'database',
  'expect-plan-sha256',
  'help',
  'manifest',
  'project',
  'service-account',
])

const args = parseArgs(process.argv.slice(2))
assertAllowedArgs(args)

if (booleanFlag(args, 'help')) {
  printUsage()
  process.exit(0)
}

const options = validateOptions(args)
const credential = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: INTERLAKEN_PIZZA_TARGET.projectId,
})
const adminApp = initializeApp(
  {
    credential: credential.credential,
    projectId: INTERLAKEN_PIZZA_TARGET.projectId,
    storageBucket: INTERLAKEN_PIZZA_TARGET.storageBucket,
  },
  `${OPERATION}-${Date.now()}`
)

try {
  const db = getFirestore(adminApp, INTERLAKEN_PIZZA_TARGET.databaseId)
  const bucket = getStorage(adminApp).bucket(
    INTERLAKEN_PIZZA_TARGET.storageBucket
  )
  const plan = await buildInterlakenImagePlan({
    actor: options.actor,
    bucket,
    db,
    manifestPath: options.manifestPath,
    repoRoot: process.cwd(),
  })
  const output = interlakenImagePlanOutput(plan)
  printPlan(output, options.apply)

  if (!options.apply) {
    console.log(
      `\nReviewed apply requires --apply --expect-plan-sha256 ${plan.planSha256} --confirm ${CONFIRMATION} --backup <new-absolute-json-path>.`
    )
  } else {
    if (options.expectedPlanSha256 !== plan.planSha256) {
      throw new Error(
        `Live plan sha256 changed. Expected ${options.expectedPlanSha256}; received ${plan.planSha256}. Run and review a new dry plan.`
      )
    }
    if (plan.blockers.length) {
      throw new Error('Apply is blocked. Resolve the printed plan blockers first.')
    }

    const backup = await writeInterlakenImagePreimage({
      backupPath: options.backupPath,
      plan,
    })
    console.log(`\nProtected preimage: ${backup.path} sha256=${backup.sha256}`)
    const result = await applyInterlakenImagePlan({ bucket, db, plan })
    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          target: INTERLAKEN_PIZZA_TARGET,
          credentialSource: credential.source,
          manifestSha256: plan.manifestSha256,
          planSha256: plan.planSha256,
          backup,
          result,
        },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(adminApp)
}

function printPlan(output, apply) {
  console.log(`\nInterlaken Pizza Dish images (${apply ? 'apply' : 'dry-run'})`)
  console.table([
    { measure: 'Planned Dish image updates', count: output.counts.planned },
    { measure: 'Exact matches', count: output.counts.exact },
    { measure: 'Probable alias-exact matches', count: output.counts.probable },
    { measure: 'New Storage objects', count: output.counts.storageCreates },
    {
      measure: 'Identical Storage objects reused',
      count: output.counts.identicalStorageReuses,
    },
    {
      measure: 'Existing Dish images preserved',
      count: output.counts.existingImagesPreserved,
    },
    {
      measure: 'Reviewed wrong source images excluded',
      count: output.counts.reviewedSourceImagesExcluded,
    },
    { measure: 'Blockers', count: output.counts.blockers },
  ])
  console.table(
    output.entries.map(
      ({ dishId, dishName, matchStatus, storageAction, websiteProductId }) => ({
        sourceId: websiteProductId,
        dishId,
        dishName,
        match: matchStatus,
        storage: storageAction,
      })
    )
  )
  const probable = output.entries.filter(
    (entry) => entry.matchStatus === 'probable'
  )
  if (probable.length) {
    console.log('\nProbable source → Dish mappings')
    console.table(
      probable.map((entry) => ({
        sourceId: entry.websiteProductId,
        sourceName: entry.websiteName,
        sourceImage: entry.websiteImageUrl,
        dishId: entry.dishId,
        dishName: entry.dishName,
        confidence: entry.confidence,
      }))
    )
  }
  if (output.skipped.length) {
    console.log('\nSkipped or preserved images')
    console.table(output.skipped)
  }
  if (output.blockers.length) {
    console.log('\nBlockers')
    console.table(output.blockers)
  }
  console.log(`Manifest:        ${output.manifestPath}`)
  console.log(`Manifest sha256: ${output.manifestSha256}`)
  console.log(`Plan sha256:     ${output.planSha256}`)
  console.log(`Remote writes:   ${apply ? 'pending explicit apply' : 0}`)
}

function validateOptions(values) {
  fixedTarget(values, 'project', INTERLAKEN_PIZZA_TARGET.projectId)
  fixedTarget(values, 'database', INTERLAKEN_PIZZA_TARGET.databaseId)
  const apply = booleanFlag(values, 'apply')
  const actor = textArg(values, 'actor') || `system:${OPERATION}`
  const backupPath = textArg(values, 'backup')
  const confirmation = textArg(values, 'confirm')
  const expectedPlanSha256 = textArg(values, 'expect-plan-sha256').toLowerCase()
  textArg(values, 'service-account')
  const manifestPath = fixedManifestPath(values.manifest, process.cwd())

  if (apply) {
    if (confirmation !== CONFIRMATION) {
      throw new Error(`Apply requires --confirm ${CONFIRMATION}.`)
    }
    if (!/^[a-f0-9]{64}$/.test(expectedPlanSha256)) {
      throw new Error('Apply requires --expect-plan-sha256 <reviewed-sha256>.')
    }
    if (!backupPath || !path.isAbsolute(backupPath)) {
      throw new Error('Apply requires --backup <new-absolute-json-path>.')
    }
  } else if (
    values.backup !== undefined ||
    values.confirm !== undefined ||
    values['expect-plan-sha256'] !== undefined
  ) {
    throw new Error(
      '--backup, --confirm, and --expect-plan-sha256 are valid only with --apply.'
    )
  }

  return {
    actor,
    apply,
    backupPath,
    expectedPlanSha256,
    manifestPath,
  }
}

function assertAllowedArgs(values) {
  for (const key of Object.keys(values)) {
    if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
  }
}

function booleanFlag(values, key) {
  const value = values[key]
  if (value === undefined) return false
  if (value !== true) throw new Error(`--${key} is a flag and takes no value.`)
  return true
}

function textArg(values, key) {
  const value = values[key]
  if (value === undefined) return ''
  if (value === true) throw new Error(`--${key} requires a value.`)
  return String(value).trim()
}

function fixedTarget(values, key, expected) {
  const value = textArg(values, key) || expected
  if (value !== expected) {
    throw new Error(`This importer only supports --${key} ${expected}.`)
  }
  return value
}

function fixedManifestPath(value, repoRoot) {
  if (value === true) throw new Error('--manifest requires a value.')
  const outputRoot = path.resolve(repoRoot, INTERLAKEN_PIZZA_OUTPUT_ROOT)
  const resolved = path.resolve(
    repoRoot,
    String(value ?? INTERLAKEN_PIZZA_DEFAULT_MANIFEST)
  )
  if (!resolved.startsWith(`${outputRoot}${path.sep}`)) {
    throw new Error(`--manifest must stay under ${INTERLAKEN_PIZZA_OUTPUT_ROOT}/.`)
  }
  if (path.extname(resolved).toLowerCase() !== '.json') {
    throw new Error('--manifest must name a .json file.')
  }
  return resolved
}

function printUsage() {
  console.log(`
Publish reviewed Interlaken Pizza images to canonical Misebox Dish records.

Dry-run (default):
  pnpm interlaken:images:import

Apply the exact reviewed live plan:
  pnpm interlaken:images:import -- \\
    --apply \\
    --expect-plan-sha256 <reviewed-sha256> \\
    --confirm ${CONFIRMATION} \\
    --backup /private/tmp/interlaken-pizza-dish-images-preimage.json

The importer is fixed to project ${INTERLAKEN_PIZZA_TARGET.projectId}, database
${INTERLAKEN_PIZZA_TARGET.databaseId}, App ${INTERLAKEN_PIZZA_TARGET.appId}, and
Kitchen ${INTERLAKEN_PIZZA_TARGET.kitchenId}. It writes only empty Dish.image_url
fields. Existing images, descriptions, prices, options, and MenuItems are never
changed. Storage objects are created only when the canonical path is absent;
identical failed-run objects may be reused.

Options:
  --manifest <path>          Audit manifest under ${INTERLAKEN_PIZZA_OUTPUT_ROOT}/.
  --actor <id>               Operational updated.by stamp.
  --project <id>             Must equal the fixed project.
  --database <id>            Must equal the fixed database.
  --service-account <path>   Explicit Firebase Admin service account JSON.

Credential resolution:
  ${firebaseAdminCredentialHelp().join('\n  ')}
`)
}
