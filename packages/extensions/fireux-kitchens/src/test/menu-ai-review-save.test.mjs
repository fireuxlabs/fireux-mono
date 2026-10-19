import assert from 'node:assert/strict'
import test from 'node:test'
import { Firestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const reviewSource = readFileSync(
  new URL('../runtime/menu/server/ai/review.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export type[^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const loadReview = (deps) =>
  compileFunction(
    stripTypeScriptTypes(reviewSource) +
      '; return { processKitchenMenuAiReview }',
    Object.keys(deps)
  )(...Object.values(deps))

test('completed AI review replaces its process map with a Firestore-valid update and preserves the review draft', async () => {
  const db = new Firestore({ projectId: 'menu-review-local-validation' })
  const sections = [{ label: 'Snacks', items: [{ name: 'Toast', price: 7.5 }] }]
  const stamp = { at: 1, by: 'operator' }
  let saved
  const extraction = {
    ok: true,
    provider: 'test',
    model: 'test-model',
    data: { name: 'Test menu', sections },
    files: [],
    normalized: { status: 'complete', sections },
  }
  const { processKitchenMenuAiReview } = loadReview({
    FieldValue,
    getRuntimeFirestore: () => ({
      doc: () => ({
        get: async () => ({ exists: true, id: 'upload', data: () => ({}) }),
      }),
    }),
    readString: (value) => String(value ?? '').trim(),
    serverAuditStamp: () => stamp,
    menuAiReviewRecord: (value) =>
      value && typeof value === 'object' ? value : {},
    countExtractedMenuItems: (rows) =>
      rows.reduce((n, row) => n + row.items.length, 0),
    menuAiReviewErrorMessage: (cause) => cause.message,
    menuAiCheckpointValue: () => ({}),
    kitchenMenuUploadPath: () => 'kitchens/k/menu-uploads/upload',
    kitchenMenuUploadKitchenPath: () => 'kitchens/k',
    sourceRows: () => [{ id: 'pdf' }],
    menuAiModelPlan: () => ({
      extraction_model: 'test-model',
      normalization_model: 'test-model',
    }),
    estimateMenuAiCost: () => ({
      currency: 'USD',
      amount_minor: 5,
      amount_label: '$0.05',
    }),
    menuAiExtractionCacheKey: () => 'cache-key',
    cachedMenuExtraction: () => extraction,
    checkpointedMenuExtraction: () => null,
    readKitchenMenuCurrentShape: async () => ({ menu: {}, sections: [] }),
    kitchenMenuBaselineFlags: () => [],
    normalizeKitchenMenuDraftSections: (data) => data.sections || [],
    compareKitchenMenuDraftToCurrent: () => ({ flags: [], counts: {} }),
    actualMenuAiCost: () => ({
      amount_minor: 0,
      currency: 'USD',
      actual: true,
    }),
    MENU_SOURCE_EXTRACTION_PROMPT_VERSION: 'test',
    writeKitchenMenuAiUsage: async (input) => {
      saved = input.sourceUpdate
      // The real SDK validates the exact update shape locally; no commit/network call.
      db.batch().update(db.doc('kitchens/k/menu-uploads/upload'), saved)
      return { amount_minor: 0 }
    },
  })
  const result = await processKitchenMenuAiReview({
    event: {},
    appId: 'app',
    kitchenId: 'k',
    menuId: 'upload',
    uploadId: 'upload',
    uid: 'operator',
    currencyCode: 'CHF',
  })
  assert.equal(result.ok, true)
  assert.equal(saved.status, 'draft')
  assert.deepEqual(saved.ai_process, {
    stage: 'complete',
    key: 'cache-key',
    updated: stamp,
  })
  assert.equal(saved.ai_draft.name, 'Test menu')
  assert.deepEqual(saved.ai_draft.sections, sections)
  assert.equal(result.write.menu_written, false)
  await db.terminate()
})
