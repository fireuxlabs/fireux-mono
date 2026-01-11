#!/usr/bin/env node
/**
 * Deletes ALL Firebase Storage objects under apps/{appId}/media/**
 * for each app found in temp/app-media-audit.json.
 *
 * This is intentionally destructive. Defaults to dry-run.
 *
 * Usage:
 *   pnpm delete:app-media-folders
 *   pnpm delete:app-media-folders -- --apply
 *   pnpm delete:app-media-folders -- --ecosystem fireux --apply
 *   pnpm delete:app-media-folders -- --ecosystem fireux --app fireux-app --apply
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import admin from 'firebase-admin'

import { parseArgs } from './_lib/args.mjs'
import { listBucketObjects } from './_lib/firebase-storage.mjs'

const workspaceRoot = process.cwd()
const auditPath = path.join(workspaceRoot, 'temp', 'app-media-audit.json')

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    console.log(`Usage: pnpm delete:app-media-folders -- [--ecosystem <id>] [--app <appId>] [--apply]

Deletes ALL objects under apps/{appId}/media/** for each audited app.

By default this is a dry-run. Pass --apply to actually delete.
`)
    process.exit(0)
  }

  if (!fs.existsSync(auditPath)) {
    console.error(`Missing ${auditPath}. Run pnpm audit:app-media first.`)
    process.exit(1)
  }

  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
  const requestedEcosystem = args.ecosystem ? String(args.ecosystem) : null
  const requestedAppId = args.app ? String(args.app) : null
  const apply = Boolean(args.apply)

  const ecosystems = audit?.ecosystems ?? {}
  const ecosystemIds = Object.keys(ecosystems)
    .filter((id) => (requestedEcosystem ? id === requestedEcosystem : true))
    .sort()

  if (!ecosystemIds.length) {
    console.error(
      requestedEcosystem
        ? `No matching ecosystem ${requestedEcosystem} in ${path.relative(workspaceRoot, auditPath)}`
        : `No ecosystems found in ${path.relative(workspaceRoot, auditPath)}`
    )
    process.exit(1)
  }

  const plan = []

  for (const ecoId of ecosystemIds) {
    const eco = ecosystems[ecoId]
    const projectId = eco?.projectId
    const bucketName = eco?.bucket
    const serviceAccountRel = eco?.serviceAccount

    if (!projectId || !bucketName || !serviceAccountRel) {
      console.warn(`[skip] ${ecoId}: missing projectId/bucket/serviceAccount in audit report`)
      continue
    }

    const serviceAccountPath = path.join(workspaceRoot, serviceAccountRel)
    if (!fs.existsSync(serviceAccountPath)) {
      console.warn(`[skip] ${ecoId}: missing service account at ${serviceAccountRel}`)
      continue
    }

    const appIds = Object.keys(eco?.apps ?? {})
      .filter((id) => (requestedAppId ? id === requestedAppId : true))
      .sort()

    if (!appIds.length) {
      console.warn(`[skip] ${ecoId}: no matching apps`)
      continue
    }

    const app = admin.initializeApp(
      {
        credential: admin.credential.cert(
          JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
        ),
        projectId,
        storageBucket: bucketName,
      },
      `delete-media-${ecoId}`
    )

    const bucket = app.storage().bucket()

    for (const appId of appIds) {
      const prefix = `apps/${appId}/media/`
      const objects = await listBucketObjects(bucket, prefix)
      objects.sort()

      plan.push({
        ecosystemId: ecoId,
        projectId,
        bucket: bucketName,
        appId,
        prefix,
        count: objects.length,
        objects,
      })

      if (!apply) continue

      for (const name of objects) {
        await bucket.file(name).delete({ ignoreNotFound: true })
      }
    }
  }

  // Print a concise summary
  let total = 0
  for (const entry of plan) total += entry.count

  const mode = apply ? 'APPLY (deleted)' : 'DRY RUN (no deletes)'
  console.log(`[delete:app-media-folders] ${mode}`)
  console.log(`Targets: ${plan.length} app(s)`)
  console.log(`Total objects under apps/*/media/: ${total}`)

  // Print per-app counts, and sample first few names when present
  for (const entry of plan) {
    console.log(
      `- ${entry.ecosystemId}/${entry.appId}: ${entry.count} object(s) under ${entry.prefix}`
    )
    if (entry.count) {
      const sample = entry.objects.slice(0, 5)
      for (const name of sample) console.log(`  - ${name}`)
      if (entry.count > sample.length) console.log(`  - … (+${entry.count - sample.length} more)`)
    }
  }

  if (!apply) {
    console.log('Run again with --apply to perform deletions.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
