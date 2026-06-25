#!/usr/bin/env node
// @fireux-script
// last_used: 2026-06-25
// usage_note: baseline after scripts cleanup; update when run.
/**
 * Syncs app media from local /public/img/app/* into Firebase Storage and Firestore.
 *
 * Canon:
 * - Storage objects: apps/{appId}/media/{thumbnail|logo|wordmark-light|wordmark-dark|cover}
 * - Firestore fields: media.{thumbnail_url|logo_url|wordmark_light_url|wordmark_dark_url|cover_url}
 *
 * Uses per-ecosystem service accounts from temp/app-media-audit.json.
 *
 * Usage:
 *   pnpm sync:app-media-from-public
 *   pnpm sync:app-media-from-public -- --apply
 *   pnpm sync:app-media-from-public -- --ecosystem fireux-misebox --apply
 *   pnpm sync:app-media-from-public -- --ecosystem fireux --app fireux-app --apply
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import crypto from 'node:crypto'
import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

import { parseArgs } from './_lib/args.mjs'

const workspaceRoot = process.cwd()
const auditPath = path.join(workspaceRoot, 'temp', 'app-media-audit.json')

function stableJson(value) {
  return JSON.stringify(value, null, 2) + '\n'
}

function normaliseProjectSegment(ecosystemId) {
  const raw = String(ecosystemId || '').trim()
  if (!raw) return ''
  if (raw === 'fireux') return 'fireux'
  if (raw.startsWith('fireux-')) return raw.slice('fireux-'.length)
  return raw
}

function candidatePublicDirs({ ecosystemId, appId }) {
  const projectSegment = normaliseProjectSegment(ecosystemId)

  // Known special-case mapping.
  const appFolder = appId === 'fireux-tenant' ? 'tenant' : appId

  const dirs = []

  // Project-level public dirs.
  if (projectSegment) {
    dirs.push(path.join(workspaceRoot, 'projects', projectSegment, appFolder, 'public'))
    dirs.push(path.join(workspaceRoot, 'projects', projectSegment, `${appFolder}-app`, 'public'))
  }

  // Shared/public fallbacks.
  dirs.push(path.join(workspaceRoot, 'public'))
  dirs.push(
    path.join(
      workspaceRoot,
      'packages',
      'core',
      'fireux-core',
      'src',
      'runtime',
      'public'
    )
  )

  // Ecosystem package public.
  if (projectSegment) {
    dirs.push(
      path.join(
        workspaceRoot,
        'packages',
        'ecosystem',
        `fireux-${projectSegment}`,
        'src',
        'runtime',
        'public'
      )
    )
  }

  // De-dup while preserving order.
  const seen = new Set()
  return dirs.filter((d) => {
    const key = path.normalize(d)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function resolveLocalAsset({ ecosystemId, appId }, relative) {
  const candidates = candidatePublicDirs({ ecosystemId, appId })
  for (const base of candidates) {
    const full = path.join(base, relative)
    if (fs.existsSync(full)) return full
  }
  return null
}

function randomToken() {
  return crypto.randomBytes(16).toString('hex')
}

function firebaseDownloadUrl(bucketName, objectPath, token) {
  const encoded = encodeURIComponent(objectPath)
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media&token=${token}`
}

function mediaPatch(urls) {
  return {
    media: {
      thumbnail_url: urls['thumbnail'] ?? '',
      logo_url: urls['logo'] ?? '',
      wordmark_light_url: urls['wordmark-light'] ?? '',
      wordmark_dark_url: urls['wordmark-dark'] ?? '',
      cover_url: urls['cover'] ?? '',
    },
    // Remove legacy fields if they exist.
    thumbnail_url: admin.firestore.FieldValue.delete(),
    logo_url: admin.firestore.FieldValue.delete(),
    wordmark_light_url: admin.firestore.FieldValue.delete(),
    wordmark_dark_url: admin.firestore.FieldValue.delete(),
    cover_url: admin.firestore.FieldValue.delete(),
    avatar_url: admin.firestore.FieldValue.delete(),
    wordmark_url: admin.firestore.FieldValue.delete(),
  }
}

async function uploadWithToken(bucket, bucketName, objectPath, localFilePath) {
  const token = randomToken()
  await bucket.upload(localFilePath, {
    destination: objectPath,
    resumable: false,
    metadata: {
      cacheControl: 'public,max-age=3600',
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  })
  return firebaseDownloadUrl(bucketName, objectPath, token)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    console.log(`Usage: pnpm sync:app-media-from-public -- [--ecosystem <id>] [--app <appId>] [--apply]

Dry-run by default; pass --apply to upload and write Firestore.
Reads targets from temp/app-media-audit.json.
`)
    process.exit(0)
  }

  if (!fs.existsSync(auditPath)) {
    console.error(`Missing ${auditPath}. Run pnpm audit:app-media first.`)
    process.exit(1)
  }

  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'))
  const ecosystems = audit?.ecosystems ?? {}

  const requestedEcosystem = args.ecosystem ? String(args.ecosystem) : null
  const requestedAppId = args.app ? String(args.app) : null
  const apply = Boolean(args.apply)

  const plan = {
    generatedAt: new Date().toISOString(),
    mode: apply ? 'apply' : 'dry-run',
    targets: [],
    missing: [],
  }

  const expectedAssets = [
    { kind: 'thumbnail', relative: path.join('img', 'app', 'thumbnail.png') },
    { kind: 'logo', relative: path.join('img', 'app', 'logo.png') },
    { kind: 'wordmark-light', relative: path.join('img', 'app', 'wordmark-light.png') },
    { kind: 'wordmark-dark', relative: path.join('img', 'app', 'wordmark-dark.png') },
    { kind: 'cover', relative: path.join('img', 'app', 'cover.png') },
  ]

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

  for (const ecoId of ecosystemIds) {
    const eco = ecosystems[ecoId]
    const projectId = eco?.projectId
    const databaseId =
      typeof eco?.databaseId === 'string' && eco.databaseId !== '(default)'
        ? eco.databaseId
        : ''
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
      `sync-media-${ecoId}`
    )

    const bucket = app.storage().bucket()
    const firestore = databaseId ? getFirestore(app, databaseId) : app.firestore()

    for (const appId of appIds) {
      const appMeta = eco?.apps?.[appId] ?? {}
      const resolved = []
      const missing = []

      for (const asset of expectedAssets) {
        const local = resolveLocalAsset({ ecosystemId: ecoId, appId }, asset.relative)
        if (!local) {
          missing.push({ kind: asset.kind, relative: asset.relative })
        } else {
          resolved.push({ kind: asset.kind, relative: asset.relative, local })
        }
      }

      if (missing.length) {
        plan.missing.push({
          ecosystemId: ecoId,
          appId,
          missing,
          searched: candidatePublicDirs({ ecosystemId: ecoId, appId }),
        })
        console.warn(`[skip] ${ecoId}/${appId}: missing ${missing.map((m) => m.relative).join(', ')}`)
        continue
      }

      const target = {
        ecosystemId: ecoId,
        appId,
        bucket: bucketName,
        uploads: resolved.map((r) => ({
          kind: r.kind,
          local: path.relative(workspaceRoot, r.local),
          objectPath: `apps/${appId}/media/${r.kind}`,
        })),
      }

      plan.targets.push(target)

      if (!apply) continue

      const urls = {}
      for (const r of resolved) {
        const objectPath = `apps/${appId}/media/${r.kind}`
        const url = await uploadWithToken(bucket, bucketName, objectPath, r.local)
        urls[r.kind] = url
      }

      await firestore.collection('apps').doc(appId).set(
        mediaPatch(urls),
        { merge: true }
      )

      const appDatabaseId =
        typeof appMeta.databaseId === 'string' && appMeta.databaseId.trim()
          ? appMeta.databaseId.trim()
          : ''

      if (appDatabaseId && appDatabaseId !== databaseId) {
        const appDb = getFirestore(app, appDatabaseId)
        await appDb.collection('apps').doc(appId).set(mediaPatch(urls), { merge: true })
      }

      console.log(
        `[ok] ${ecoId}/${appId}: uploaded 5 objects + wrote Firestore URLs` +
          (appDatabaseId && appDatabaseId !== databaseId
            ? ` + app database ${appDatabaseId}`
            : '')
      )
    }
  }

  const outPath = path.join(workspaceRoot, 'temp', 'app-media-sync-plan.json')
  fs.writeFileSync(outPath, stableJson(plan))

  console.log(`Wrote: ${path.relative(workspaceRoot, outPath)}`)
  console.log(`Mode: ${plan.mode}`)
  console.log(`Targets: ${plan.targets.length}`)
  console.log(`Missing: ${plan.missing.length}`)

  if (!apply) {
    console.log('Re-run with --apply to perform uploads + Firestore updates.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
