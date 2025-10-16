/**
 * scripts/migrate-chefs.ts
 * One-off migration to normalize chef profiles in top-level `chefs` collection.
 *
 * Behavior:
 * 1) Reads all docs under `chefs`.
 * 2) For each doc, computes a patch (non-destructive):
 *    - If `display_name` missing, set it from `name` (even if it contains '@').
 *    - Ensure `avatar` exists (default to empty string if missing).
 *    - If `created_at` missing, set to serverTimestamp().
 *    - If `updated_at` missing, set to serverTimestamp().
 * 3) Writes the patch with { merge: true }.
 * 4) Logs a concise summary: total scanned, patched count, sample doc IDs changed.
 *
 * Flags:
 * --dry  Dry-run: print what would be written without performing writes.
 *
 * Notes:
 * - Idempotent: runs should converge. Second run should make 0 changes.
 * - Batching: chunks of 400 writes per batch (limit < 500).
 * - Auth: expects GOOGLE_APPLICATION_CREDENTIALS to be set (ADC).
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue, WriteBatch } from 'firebase-admin/firestore'

const DRY_RUN = process.argv.includes('--dry') || process.argv.includes('-d')

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  // Initialize admin using ADC (GOOGLE_APPLICATION_CREDENTIALS)
  initializeApp({ credential: applicationDefault() })
  const db = getFirestore()

  const col = db.collection('chefs')
  const snap = await col.get()

  let scanned = 0
  let patched = 0
  const changedIds: string[] = []
  type Patch = Record<string, unknown>
  const pending: { id: string; patch: Patch }[] = []

  for (const doc of snap.docs) {
    scanned += 1
    const data = doc.data() || {}

    const hasDisplayName =
      data.display_name !== undefined && data.display_name !== null
    const hasAvatar = data.avatar !== undefined && data.avatar !== null
    const hasCreatedAt =
      data.created_at !== undefined && data.created_at !== null
    const hasUpdatedAt =
      data.updated_at !== undefined && data.updated_at !== null

    const patch: Patch = {}

    // If display_name missing, set from name (even if contains '@')
    if (!hasDisplayName && typeof data.name === 'string') {
      patch.display_name = data.name
    }

    // Ensure avatar exists
    if (!hasAvatar) {
      patch.avatar = ''
    }

    // Timestamps (only if missing)
    if (!hasCreatedAt) {
      patch.created_at = FieldValue.serverTimestamp()
    }
    if (!hasUpdatedAt) {
      patch.updated_at = FieldValue.serverTimestamp()
    }

    if (Object.keys(patch).length > 0) {
      pending.push({ id: doc.id, patch })
    }
  }

  if (pending.length === 0) {
    console.log(`No changes needed. Scanned ${scanned} docs, patched 0.`)
    return
  }

  if (DRY_RUN) {
    const sample = pending.slice(0, 5)
    console.log(
      `[DRY] Would patch ${pending.length} docs out of ${scanned}. Sample:`
    )
    for (const s of sample) {
      console.log(`- ${s.id}:`, summarizePatch(s.patch))
    }
    return
  }

  // Batch in chunks of 400
  const chunks = chunk(pending, 400)
  for (const group of chunks) {
    const batch: WriteBatch = db.batch()
    for (const { id, patch } of group) {
      const ref = col.doc(id)
      batch.set(ref, patch, { merge: true })
      changedIds.push(id)
      patched += 1
    }
    await batch.commit()
  }

  const sampleIds = changedIds.slice(0, 5)
  console.log(
    `Scanned ${scanned} docs, patched ${patched}. Sample changed IDs: ${sampleIds.join(', ')}`
  )
}

function summarizePatch(patch: Record<string, unknown>) {
  // Avoid printing FieldValue objects verbosely
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) {
    if (v === FieldValue.serverTimestamp()) out[k] = 'serverTimestamp()'
    else out[k] = v
  }
  return out
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exitCode = 1
})
