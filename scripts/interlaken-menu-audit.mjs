#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-21
// usage_note: run the fixed-target, read-only Interlaken Pizza website versus Misebox Dish/MenuItem audit and optionally stage approved source images.
// Concurrent edit — 2026-07-21 23:22 CEST — Interlaken Pizza audit: add the repeatable dry audit and local image-staging entrypoint.

import path from 'node:path'
import process from 'node:process'

import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { auditInterlakenImages } from './_lib/interlaken-pizza-audit-images.mjs'
import { buildInterlakenAudit } from './_lib/interlaken-pizza-audit-matching.mjs'
import { readInterlakenCurrentState } from './_lib/interlaken-pizza-firestore.mjs'
import {
  buildInterlakenManifest,
  printInterlakenSummary,
  skippedInterlakenImageAudit,
  writeInterlakenManifest,
} from './_lib/interlaken-pizza-report.mjs'
import {
  fetchInterlakenSource,
  parseInterlakenMenuHtml,
} from './_lib/interlaken-pizza-source.mjs'
import {
  INTERLAKEN_PIZZA_DEFAULT_MANIFEST,
  INTERLAKEN_PIZZA_OUTPUT_ROOT,
  INTERLAKEN_PIZZA_SOURCE_URL,
  INTERLAKEN_PIZZA_TARGET,
} from './_lib/interlaken-pizza-target.mjs'

const {
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  databaseEdition: DATABASE_EDITION,
  appId: APP_ID,
  kitchenId: KITCHEN_ID,
  menuId: MENU_ID,
} = INTERLAKEN_PIZZA_TARGET

const ALLOWED_ARGS = new Set([
  'app',
  'database',
  'help',
  'image-concurrency',
  'images',
  'kitchen',
  'menu',
  'out',
  'project',
  'service-account',
  'source',
])

const rawArgs = process.argv.slice(2)
const args = parseArgs(rawArgs)
assertSafeArgs(rawArgs)

if (booleanFlag(args, 'help')) {
  console.log(`
Audit the live Interlaken Pizza menu against the fixed Misebox kitchen target.

Usage:
  pnpm interlaken:menu-audit
  pnpm interlaken:images
  node scripts/interlaken-menu-audit.mjs [--images]

This audit command is read-only. It never writes Firestore or Storage, and it
rejects --apply and --commit. --images only saves confidently matched website
source assets locally and converts originals that already contain real
transparency. Opaque photos remain classified for manual cut-out. A separate
pnpm interlaken:images:import command plans and explicitly applies reviewed
Dish image publication.

Fixed target:
  project:  ${PROJECT_ID}
  database: ${DATABASE_ID} (${DATABASE_EDITION})
  app:      ${APP_ID}
  kitchen:  ${KITCHEN_ID}
  menu:     ${MENU_ID}

Options:
  --images                    Stage approved source assets and transparent copies.
  --image-concurrency <1-8>   Parallel image requests (default: 2).
  --out <path>                Manifest path under ${INTERLAKEN_PIZZA_OUTPUT_ROOT}/.
  --source <url>              Must resolve to ${INTERLAKEN_PIZZA_SOURCE_URL}.
  --service-account <path>    Explicit Firebase Admin service account JSON.

Credential resolution:
  ${firebaseAdminCredentialHelp().join('\n  ')}
`)
  process.exit(0)
}

const projectId = fixedTarget(args, 'project', PROJECT_ID)
const databaseId = fixedTarget(args, 'database', DATABASE_ID)
fixedTarget(args, 'app', APP_ID)
fixedTarget(args, 'kitchen', KITCHEN_ID)
fixedTarget(args, 'menu', MENU_ID)
const sourceUrl = fixedSource(args.source)
const stageImages = booleanFlag(args, 'images')
const imageConcurrency = integerArg(args, 'image-concurrency', 2, 1, 8)
const repoRoot = process.cwd()
const manifestPath = outputPath(args.out, repoRoot)
const sourceDirectory = path.join(
  repoRoot,
  INTERLAKEN_PIZZA_OUTPUT_ROOT,
  'images',
  'source'
)
const convertedDirectory = path.join(
  repoRoot,
  INTERLAKEN_PIZZA_OUTPUT_ROOT,
  'images',
  'converted'
)

const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId,
})
const adminApp = initializeApp(
  {
    credential: resolved.credential,
    projectId,
  },
  `interlaken-menu-audit-${Date.now()}`
)
const db = getFirestore(adminApp, databaseId)

try {
  const [remoteState, fetched] = await Promise.all([
    readInterlakenCurrentState(db),
    fetchInterlakenSource(sourceUrl),
  ])
  const source = parseInterlakenMenuHtml(fetched.html, fetched.finalUrl)

  if (!source.products.length || source.warnings.length) {
    throw new Error(
      source.warnings.length
        ? `Website parser warnings must be reviewed: ${source.warnings.join(' ')}`
        : 'Website parser found no products.'
    )
  }

  const comparison = buildInterlakenAudit({
    dishes: remoteState.dishes,
    menuItems: remoteState.menuItems,
    source,
  })
  const imageAudit = stageImages
    ? await auditInterlakenImages(comparison.products, {
        convertedDirectory,
        sourceDirectory,
        stageApproved: stageImages,
        concurrency: imageConcurrency,
        repoRoot,
      })
    : skippedInterlakenImageAudit(comparison.products)
  const manifest = buildInterlakenManifest({
    comparison,
    fetched,
    imageAudit,
    remoteState,
    source,
    stageImages,
  })
  await writeInterlakenManifest(manifestPath, manifest)
  printInterlakenSummary(manifest, manifestPath, repoRoot)
} finally {
  await deleteApp(adminApp)
}

function assertSafeArgs(tokens) {
  for (const token of tokens) {
    if (!token.startsWith('--')) continue
    if (token === '--') continue
    const key = token.slice(2).split('=')[0]
    if (key === 'apply' || key === 'commit') {
      throw new Error(
        'This audit command is read-only. Use pnpm interlaken:images:import for the separate dry-run-first publisher.'
      )
    }
    if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
  }
}

function booleanFlag(values, key) {
  const value = values[key]
  if (value === undefined) return false
  if (value !== true) throw new Error(`--${key} is a flag and takes no value.`)
  return true
}

function fixedTarget(values, key, expected) {
  const value = String(values[key] ?? expected).trim()
  if (value !== expected) {
    throw new Error(`This audit only supports --${key} ${expected}.`)
  }
  return value
}

function fixedSource(value) {
  const requested = String(value ?? INTERLAKEN_PIZZA_SOURCE_URL).trim()
  let normalized
  try {
    normalized = new URL(requested)
  } catch {
    throw new Error('--source must be a valid URL.')
  }
  const expected = new URL(INTERLAKEN_PIZZA_SOURCE_URL)
  if (
    normalized.protocol !== expected.protocol ||
    normalized.hostname !== expected.hostname ||
    normalized.pathname.replace(/\/$/, '') !== expected.pathname
  ) {
    throw new Error(
      `This audit only supports --source ${INTERLAKEN_PIZZA_SOURCE_URL}.`
    )
  }
  normalized.search = ''
  normalized.hash = ''
  return normalized.href
}

function integerArg(values, key, fallback, minimum, maximum) {
  if (values[key] === undefined) return fallback
  if (values[key] === true) throw new Error(`--${key} requires a value.`)
  const value = Number(values[key])
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `--${key} must be an integer from ${minimum} to ${maximum}.`
    )
  }
  return value
}

function outputPath(value, root) {
  const outputRoot = path.resolve(root, INTERLAKEN_PIZZA_OUTPUT_ROOT)
  const resolved = path.resolve(
    root,
    String(value ?? INTERLAKEN_PIZZA_DEFAULT_MANIFEST)
  )
  if (
    resolved !== outputRoot &&
    !resolved.startsWith(`${outputRoot}${path.sep}`)
  ) {
    throw new Error(`--out must stay under ${INTERLAKEN_PIZZA_OUTPUT_ROOT}/.`)
  }
  if (path.extname(resolved).toLowerCase() !== '.json') {
    throw new Error('--out must name a .json manifest.')
  }
  return resolved
}
