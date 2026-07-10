#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-10
// usage_note: baseline after scripts cleanup; update when run.
/**
 * Lists Firebase Storage objects that are NOT part of the canonical app media layout.
 *
 * Canonical objects (keep):
 * - apps/{appId}/media/thumbnail
 * - apps/{appId}/media/logo
 * - apps/{appId}/media/wordmark-light
 * - apps/{appId}/media/wordmark-dark
 *
 * Everything else under apps/{appId}/brand/** and apps/{appId}/media/** is considered "trash".
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import admin from 'firebase-admin'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const workspaceRoot = process.cwd()
const reportPath = path.join(workspaceRoot, 'temp', 'app-media-audit.json')

function stableJson(value) {
  return JSON.stringify(value, null, 2) + '\n'
}

async function listBucketObjects(bucket, prefix) {
  const results = []
  let nextPageToken = undefined

  do {
    const [files, , apiResponse] = await bucket.getFiles({
      prefix,
      autoPaginate: false,
      maxResults: 1000,
      pageToken: nextPageToken,
    })

    for (const f of files) results.push(f.name)
    nextPageToken = apiResponse?.nextPageToken
  } while (nextPageToken)

  return results
}

function canonicalPathsForApp(appId) {
  return new Set([
    `apps/${appId}/media/thumbnail`,
    `apps/${appId}/media/logo`,
    `apps/${appId}/media/wordmark-light`,
    `apps/${appId}/media/wordmark-dark`,
  ])
}

function classify(appId, objectNames) {
  const canonical = canonicalPathsForApp(appId)

  const keep = []
  const trash = []

  for (const name of objectNames) {
    // Only operate on media/brand; ignore other app-owned objects (if any exist).
    const inBrand = name.startsWith(`apps/${appId}/brand/`)
    const inMedia = name.startsWith(`apps/${appId}/media/`)
    if (!inBrand && !inMedia) continue

    if (canonical.has(name)) keep.push(name)
    else trash.push(name)
  }

  keep.sort()
  trash.sort()

  return { keep, trash }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printUsage()
    process.exit(0)
  }

  if (!fs.existsSync(reportPath)) {
    console.error(`Missing ${reportPath}. Run pnpm audit:app-media first.`)
    process.exit(1)
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  const requestedEcosystem = String(args.ecosystem || '').trim()
  const out = {
    generatedAt: new Date().toISOString(),
    sourceAudit: path.relative(workspaceRoot, reportPath),
    ecosystems: {},
  }

  for (const [ecoId, eco] of Object.entries(report.ecosystems ?? {})) {
    if (requestedEcosystem && ecoId !== requestedEcosystem) continue

    const projectId = eco?.projectId
    const bucketName = eco?.bucket
    const ecosystemConfigPath = eco?.sourceFile

    if (!projectId || !bucketName) {
      console.warn(`[skip] ${ecoId}: missing projectId/bucket in audit report`)
      continue
    }

    const auth = await resolveFirebaseAdminCredential({
      args,
      scope: ecoId || projectId,
      projectId,
    })

    const app = admin.initializeApp(
      {
        credential: auth.credential,
        projectId,
        storageBucket: bucketName,
      },
      `trash-${ecoId}`
    )

    const bucket = app.storage().bucket()

    const ecoOut = {
      projectId,
      bucket: bucketName,
      sourceFile: ecosystemConfigPath ?? null,
      apps: {},
    }

    const appIds = Object.keys(eco?.apps ?? {})
    for (const appId of appIds) {
      const prefix = `apps/${appId}/`
      const objectNames = await listBucketObjects(bucket, prefix)
      const { keep, trash } = classify(appId, objectNames)

      ecoOut.apps[appId] = {
        keep,
        trash,
        totals: { keep: keep.length, trash: trash.length, scanned: objectNames.length },
      }
    }

    out.ecosystems[ecoId] = ecoOut
  }

  const outPath = path.join(workspaceRoot, 'temp', 'app-media-trash.json')
  fs.writeFileSync(outPath, stableJson(out))

  let totalTrash = 0
  for (const eco of Object.values(out.ecosystems)) {
    for (const app of Object.values(eco.apps)) totalTrash += app.totals.trash
  }

  console.log(`Wrote: ${path.relative(workspaceRoot, outPath)}`)
  console.log(`Total trash objects: ${totalTrash}`)
}

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/list-app-media-trash.mjs [--ecosystem <id>] [--service-account <path>]',
      '',
      'Credential sources, in precedence order:',
      ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
    ].join('\n')
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
