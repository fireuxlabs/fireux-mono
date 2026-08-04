import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { DocumentReference } from 'firebase-admin/firestore'

export async function writeKitchenMenuAiUsage(input: {
  sourceRef: DocumentReference
  sourceUpdate: Record<string, unknown>
  kitchenPath: string
  appId: string
  kitchenId: string
  menuId: string
  uploadId: string
  uid: string
  quality: string
  provider?: string
  model: string
  normalizationModel: string
  promptVersion: string
  filesCount: number
  plannedAiCalls: number
  estimate: Record<string, unknown>
  actual: {
    amount_minor: number
    amount_label: string
    currency: string
    actual: boolean
  }
  amountMinor: number
  cacheHit: boolean
  write: Record<string, unknown>
  stamp: Record<string, unknown>
}) {
  const db = getRuntimeFirestore()
  const usageRef = db.collection(`${input.kitchenPath}/ai-usage`).doc()
  const amountLabel = `$${(input.amountMinor / 100).toFixed(2)}`
  const batch = db.batch()

  batch.set(input.sourceRef, input.sourceUpdate, { merge: true })
  batch.set(usageRef, {
    id: usageRef.id,
    kind: 'menu_ai_process',
    status: input.cacheHit ? 'cached' : 'recorded',
    billable: input.amountMinor > 0,
    billing_owner: 'kitchen',
    app_id: input.appId,
    kitchen_id: input.kitchenId,
    menu_id: input.menuId,
    upload_id: input.uploadId,
    source_path: input.sourceRef.path,
    quality: input.quality,
    provider: input.provider,
    model: input.model,
    normalization_model: input.normalizationModel,
    prompt_version: input.promptVersion,
    source_files_count: input.filesCount,
    planned_ai_calls: input.plannedAiCalls,
    estimate: input.estimate,
    actual: input.actual,
    amount_minor: input.amountMinor,
    amount_label: amountLabel,
    currency: 'USD',
    cache_hit: input.cacheHit,
    write: input.write,
    created: input.stamp,
  })
  await batch.commit()

  return {
    id: usageRef.id,
    owner: 'kitchen',
    amount_minor: input.amountMinor,
    amount_label: amountLabel,
    currency: 'USD',
    actual: input.actual.actual,
    estimate: input.estimate,
    cache_hit: input.cacheHit,
  }
}
