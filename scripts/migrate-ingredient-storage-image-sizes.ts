#!/usr/bin/env node
/*
  Resize ingredient storage images in-place (same object path, same download URL token)
  to a max dimension cap to reduce storage/network cost.

  Scope:
  - Firebase Storage objects under prefix `ingredients/`
  - Only raster `image/*` objects (skips SVG/GIF by default)
  - Downscale only (no upscaling)

  Defaults:
  - max dimension: 1600px
  - JPEG/WebP quality: 86

  Usage:
    node --experimental-strip-types scripts/migrate-ingredient-storage-image-sizes.ts
    node --experimental-strip-types scripts/migrate-ingredient-storage-image-sizes.ts --commit
    node --experimental-strip-types scripts/migrate-ingredient-storage-image-sizes.ts --commit --max 1400 --quality 82
*/

import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

type Args = {
  commit: boolean
  maxDimension: number
  quality: number
  prefix: string
  serviceAccounts: string[]
}

type ObjectStats = {
  scanned: number
  updated: number
  skippedNonImage: number
  skippedUnsupported: number
  skippedWithinLimit: number
  skippedMissing: number
  bytesBefore: number
  bytesAfter: number
}

type ProjectStats = {
  projectId: string
  bucketName: string
  objects: ObjectStats
}

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_SERVICE_ACCOUNTS = [
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json',
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json',
  'packages/ecosystem/fireux-cleanbox/src/config/firebase/service-account.json',
]

const PYTHON_RESIZE_CODE = String.raw`
import json, sys
from PIL import Image, ImageOps

in_path = sys.argv[1]
out_path = sys.argv[2]
max_dim = int(sys.argv[3])
quality = int(sys.argv[4])

def emit(payload):
    sys.stdout.write(json.dumps(payload))
    sys.stdout.flush()

try:
    img = Image.open(in_path)
except Exception as e:
    emit({"ok": False, "error": f"open-failed:{e}"})
    raise SystemExit(0)

fmt = (img.format or "").upper()
if fmt in ("SVG",):
    emit({"ok": True, "changed": False, "skip": "svg"})
    raise SystemExit(0)

if getattr(img, "is_animated", False):
    emit({"ok": True, "changed": False, "skip": "animated"})
    raise SystemExit(0)

img = ImageOps.exif_transpose(img)
w, h = img.size
max_side = max(w, h) if w and h else 0
if max_side <= 0:
    emit({"ok": True, "changed": False, "skip": "empty"})
    raise SystemExit(0)

if max_side <= max_dim:
    emit({"ok": True, "changed": False, "skip": "within-limit", "width": w, "height": h})
    raise SystemExit(0)

Resampling = getattr(Image, "Resampling", Image)
img.thumbnail((max_dim, max_dim), Resampling.LANCZOS)

save_fmt = fmt if fmt else "JPEG"
save_kwargs = {}

if save_fmt in ("JPEG", "JPG"):
    save_fmt = "JPEG"
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    save_kwargs = {"quality": quality, "optimize": True, "progressive": True}
elif save_fmt == "PNG":
    save_kwargs = {"optimize": True}
elif save_fmt == "WEBP":
    save_kwargs = {"quality": quality, "method": 6}
else:
    emit({"ok": True, "changed": False, "skip": f"unsupported:{save_fmt}", "width": w, "height": h})
    raise SystemExit(0)

try:
    img.save(out_path, save_fmt, **save_kwargs)
except Exception as e:
    emit({"ok": False, "error": f"save-failed:{e}"})
    raise SystemExit(0)

emit({
    "ok": True,
    "changed": True,
    "format": save_fmt,
    "before": {"width": w, "height": h},
    "after": {"width": img.size[0], "height": img.size[1]}
})
`

function parseArgs(argv: string[]): Args {
  const out: Args = {
    commit: false,
    maxDimension: 1600,
    quality: 86,
    prefix: 'ingredients/',
    serviceAccounts: [],
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg) continue
    if (arg === '--commit') {
      out.commit = true
      continue
    }
    if (arg === '--service-account') {
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) throw new Error('Missing value for --service-account')
      out.serviceAccounts.push(next)
      i += 1
      continue
    }
    if (arg === '--max') {
      const next = Number(argv[i + 1])
      if (!Number.isFinite(next) || next <= 0) throw new Error('Invalid --max')
      out.maxDimension = Math.round(next)
      i += 1
      continue
    }
    if (arg === '--quality') {
      const next = Number(argv[i + 1])
      if (!Number.isFinite(next) || next < 1 || next > 100) throw new Error('Invalid --quality')
      out.quality = Math.round(next)
      i += 1
      continue
    }
    if (arg === '--prefix') {
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) throw new Error('Missing value for --prefix')
      out.prefix = next
      i += 1
      continue
    }
  }

  return out
}

async function readEcosystemBucketFromServiceAccountPath(serviceAccountPath: string): Promise<string | null> {
  try {
    const abs = resolve(REPO_ROOT, serviceAccountPath)
    const configPath = resolve(dirname(abs), 'ecosystem.config.ts')
    const raw = await readFile(configPath, 'utf8')
    const match = raw.match(/storageBucket:\s*['"]([^'"]+)['"]/)
    return match?.[1] ? String(match[1]) : null
  } catch {
    return null
  }
}

async function loadServiceAccount(pathLike: string) {
  const resolvedPath = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolvedPath, 'utf8')
  const parsed = JSON.parse(raw)
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }
  const configBucket = await readEcosystemBucketFromServiceAccountPath(pathLike)
  const fallbackBucket = `${String(parsed.project_id)}.appspot.com`
  return {
    resolvedPath,
    projectId: String(parsed.project_id),
    storageBucket: configBucket || fallbackBucket,
    credential: cert(parsed),
  }
}

function parseIntSafe(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

type ResizeResult =
  | { ok: true; changed: true; before?: { width: number; height: number }; after?: { width: number; height: number } }
  | { ok: true; changed: false; skip?: string; width?: number; height?: number }
  | { ok: false; error?: string }

function resizeImageWithPython(inputPath: string, outputPath: string, maxDimension: number, quality: number): ResizeResult {
  const res = spawnSync(
    'python3',
    ['-c', PYTHON_RESIZE_CODE, inputPath, outputPath, String(maxDimension), String(quality)],
    { encoding: 'utf8' }
  )

  if (res.error) {
    return { ok: false, error: String(res.error.message || res.error) }
  }
  if (res.status !== 0) {
    return { ok: false, error: `python-exit-${res.status}: ${String(res.stderr || '').trim()}` }
  }

  const stdout = String(res.stdout || '').trim()
  if (!stdout) return { ok: false, error: 'python-empty-output' }

  try {
    return JSON.parse(stdout) as ResizeResult
  } catch (error) {
    return { ok: false, error: `python-bad-json: ${String(error)}` }
  }
}

async function listBucketFiles(bucket: ReturnType<ReturnType<typeof getStorage>['bucket']>, prefix: string) {
  const out: string[] = []
  let pageToken: string | undefined

  do {
    const [files, , apiResponse] = await bucket.getFiles({
      prefix,
      autoPaginate: false,
      maxResults: 1000,
      pageToken,
    })
    for (const file of files) {
      if (file.name) out.push(file.name)
    }
    pageToken = apiResponse?.nextPageToken
  } while (pageToken)

  return out
}

async function migrateProject(pathLike: string, args: Args): Promise<ProjectStats> {
  const sa = await loadServiceAccount(pathLike)
  const appName = `ingredient-image-resize-${sa.projectId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const app = initializeApp(
    {
      credential: sa.credential,
      projectId: sa.projectId,
      storageBucket: sa.storageBucket,
    },
    appName
  )

  const storage = getStorage(app)
  const bucket = storage.bucket(sa.storageBucket)
  const tmp = await mkdtemp(resolve(tmpdir(), 'fireux-ingredient-resize-'))

  const stats: ProjectStats = {
    projectId: sa.projectId,
    bucketName: bucket.name,
    objects: {
      scanned: 0,
      updated: 0,
      skippedNonImage: 0,
      skippedUnsupported: 0,
      skippedWithinLimit: 0,
      skippedMissing: 0,
      bytesBefore: 0,
      bytesAfter: 0,
    },
  }

  console.log(`\n=== ${sa.projectId} ===`)
  console.log(`serviceAccount: ${sa.resolvedPath}`)
  console.log(`bucket: ${bucket.name}`)
  console.log(`mode: ${args.commit ? 'commit' : 'dry-run'}`)
  console.log(`prefix: ${args.prefix}`)

  try {
    const names = await listBucketFiles(bucket, args.prefix)
    if (!names.length) {
      console.log(`[${sa.projectId}] no objects under ${args.prefix}`)
      return stats
    }

    for (const name of names) {
      stats.objects.scanned += 1
      const file = bucket.file(name)

      const [exists] = await file.exists()
      if (!exists) {
        stats.objects.skippedMissing += 1
        continue
      }

      const [meta] = await file.getMetadata()
      const contentType = String(meta.contentType || '').toLowerCase()
      if (!contentType.startsWith('image/')) {
        stats.objects.skippedNonImage += 1
        continue
      }
      if (contentType === 'image/svg+xml' || contentType === 'image/gif') {
        stats.objects.skippedUnsupported += 1
        continue
      }

      const safeName = name.replace(/[^\w.-]+/g, '_')
      const inputPath = resolve(tmp, `${safeName}.in`)
      const outputPath = resolve(tmp, `${safeName}.out`)
      await file.download({ destination: inputPath })

      const resize = resizeImageWithPython(inputPath, outputPath, args.maxDimension, args.quality)
      if (!resize.ok) {
        console.warn(`[${sa.projectId}] skip (resize error) ${name}: ${resize.error}`)
        stats.objects.skippedUnsupported += 1
        continue
      }

      if (!resize.changed) {
        if (String(resize.skip || '').startsWith('unsupported')) {
          stats.objects.skippedUnsupported += 1
        } else {
          stats.objects.skippedWithinLimit += 1
        }
        continue
      }

      const beforeSize = parseIntSafe(meta.size, 0)
      const outputBuffer = await readFile(outputPath)
      const afterSize = outputBuffer.byteLength

      stats.objects.bytesBefore += beforeSize
      stats.objects.bytesAfter += afterSize

      const customMetadata = { ...(meta.metadata || {}) } as Record<string, string>
      if (!customMetadata.firebaseStorageDownloadTokens) {
        customMetadata.firebaseStorageDownloadTokens = randomUUID()
      }

      if (!args.commit) {
        console.log(
          `[dry-run] ${name} ${beforeSize} -> ${afterSize} bytes`,
          resize.before && resize.after
            ? `(${resize.before.width}x${resize.before.height} -> ${resize.after.width}x${resize.after.height})`
            : ''
        )
        stats.objects.updated += 1
        continue
      }

      await file.save(outputBuffer, {
        resumable: false,
        metadata: {
          contentType: meta.contentType || undefined,
          cacheControl: meta.cacheControl || undefined,
          contentDisposition: meta.contentDisposition || undefined,
          contentEncoding: meta.contentEncoding || undefined,
          metadata: customMetadata,
        },
      })

      console.log(
        `[updated] ${name} ${beforeSize} -> ${afterSize} bytes`,
        resize.before && resize.after
          ? `(${resize.before.width}x${resize.before.height} -> ${resize.after.width}x${resize.after.height})`
          : ''
      )
      stats.objects.updated += 1
    }

    console.log(
      `[${sa.projectId}] scanned=${stats.objects.scanned} updated=${stats.objects.updated} ` +
        `withinLimit=${stats.objects.skippedWithinLimit} nonImage=${stats.objects.skippedNonImage} ` +
        `unsupported=${stats.objects.skippedUnsupported} missing=${stats.objects.skippedMissing}`
    )
    console.log(
      `[${sa.projectId}] bytes before=${stats.objects.bytesBefore} after=${stats.objects.bytesAfter} ` +
        `saved=${Math.max(0, stats.objects.bytesBefore - stats.objects.bytesAfter)}`
    )
    return stats
  } finally {
    await rm(tmp, { recursive: true, force: true }).catch(() => {})
    await app.delete().catch(() => {})
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const serviceAccounts = args.serviceAccounts.length ? args.serviceAccounts : DEFAULT_SERVICE_ACCOUNTS

  if (getApps().length) {
    console.warn('[warn] firebase-admin apps already initialized; using named apps')
  }

  const all: ProjectStats[] = []
  for (const pathLike of serviceAccounts) {
    all.push(await migrateProject(pathLike, args))
  }

  const totals = all.reduce(
    (acc, p) => {
      const o = p.objects
      acc.scanned += o.scanned
      acc.updated += o.updated
      acc.skippedWithinLimit += o.skippedWithinLimit
      acc.skippedNonImage += o.skippedNonImage
      acc.skippedUnsupported += o.skippedUnsupported
      acc.skippedMissing += o.skippedMissing
      acc.bytesBefore += o.bytesBefore
      acc.bytesAfter += o.bytesAfter
      return acc
    },
    {
      scanned: 0,
      updated: 0,
      skippedWithinLimit: 0,
      skippedNonImage: 0,
      skippedUnsupported: 0,
      skippedMissing: 0,
      bytesBefore: 0,
      bytesAfter: 0,
    }
  )

  console.log('\n=== Ingredient Storage Resize Summary ===')
  console.log(
    JSON.stringify(
      {
        mode: args.commit ? 'commit' : 'dry-run',
        maxDimension: args.maxDimension,
        quality: args.quality,
        prefix: args.prefix,
        projects: all,
        totals: {
          ...totals,
          bytesSaved: Math.max(0, totals.bytesBefore - totals.bytesAfter),
        },
      },
      null,
      2
    )
  )
}

await main().catch((error) => {
  console.error('\nIngredient image resize migration failed:')
  console.error(error)
  process.exit(1)
})
