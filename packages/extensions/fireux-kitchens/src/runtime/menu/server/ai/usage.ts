import { randomUUID } from 'node:crypto'
import type { DocumentData, UpdateData } from 'firebase-admin/firestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenAiUsageTarget, serverKitchenMenuUploadsTarget } from '../../../kitchen/server/mutation-targets'
export async function writeKitchenMenuAiUsage(input: {
  sourceUpdate: UpdateData<DocumentData>
  appId: string
  kitchenId: string
  menuId: string
  uploadId: string
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
  const uploads = serverKitchenMenuUploadsTarget(input.kitchenId)
  const usage = serverKitchenAiUsageTarget(input.kitchenId)
  const usageId = randomUUID()
  const amountLabel = `$${(input.amountMinor / 100).toFixed(2)}`

  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    mutations.update(uploads, input.uploadId, input.sourceUpdate)
    mutations.create(usage, usageId, {
      id: usageId,
      kind: 'menu_ai_process',
      status: input.cacheHit ? 'cached' : 'recorded',
      billable: input.amountMinor > 0,
      billing_owner: 'kitchen',
      app_id: input.appId,
      kitchen_id: input.kitchenId,
      menu_id: input.menuId,
      upload_id: input.uploadId,
      source_path: `${uploads.collectionPath}/${input.uploadId}`,
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
  })

  return {
    id: usageId,
    owner: 'kitchen',
    amount_minor: input.amountMinor,
    amount_label: amountLabel,
    currency: 'USD',
    actual: input.actual.actual,
    estimate: input.estimate,
    cache_hit: input.cacheHit,
  }
}
