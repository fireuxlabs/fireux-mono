#!/usr/bin/env node
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

const workspaceRoot = process.cwd()
const reportPath = path.join(workspaceRoot, 'temp', 'app-media-audit.json')
if (!fs.existsSync(reportPath)) {
  console.error(`Missing ${reportPath}. Run pnpm audit:app-media first.`)
  process.exit(1)
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

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
  const out = {
    generatedAt: new Date().toISOString(),
    sourceAudit: path.relative(workspaceRoot, reportPath),
    ecosystems: {},
  }

  for (const [ecoId, eco] of Object.entries(report.ecosystems ?? {})) {
    const projectId = eco?.projectId
    const bucketName = eco?.bucket
    const ecosystemConfigPath = eco?.sourceFile
    const serviceAccountPath = eco?.serviceAccount

    if (!projectId || !bucketName || !serviceAccountPath) {
      console.warn(`[skip] ${ecoId}: missing projectId/bucket/serviceAccount in audit report`)
      continue
    }

    const saPath = path.join(workspaceRoot, serviceAccountPath)
    if (!fs.existsSync(saPath)) {
      console.warn(`[skip] ${ecoId}: missing service account at ${serviceAccountPath}`)
      continue
    }

    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(JSON.parse(fs.readFileSync(saPath, 'utf8'))),
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
      serviceAccountPath: path.relative(workspaceRoot, saPath),
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

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
