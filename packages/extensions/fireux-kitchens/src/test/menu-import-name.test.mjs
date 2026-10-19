import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref, reactive, watch, effectScope } from 'vue'
import { loadOfferingSource } from './offering-test-helpers.mjs'

test('extraction carries a printed title into the merged draft without using the source identity', async () => {
  const { extractMenuSourceWithAi } = loadOfferingSource(
    'menu/server/ai/extraction',
    'extractMenuSourceWithAi',
    {
      MENU_EXTRACTION_JSON_SCHEMA: {},
      MENU_CHOICE_EXTRACTION_INSTRUCTION: '',
      cachedMenuExtraction: () => {},
      checkpointedMenuExtraction: () => {},
      normalizeKitchenMenuDraftSections: (data) => data.sections || [],
      runFireuxAiDocumentExtraction: async (options) => {
        const request = options.buildRequest({
          id: 'page-1',
          file_name: 'scan.pdf',
          file_type: 'application/pdf',
        })
        assert.match(
          request.input.instruction,
          /Return name as the menu title visibly printed/
        )
        const part = options.readResult(
          {
            name: 'Breakfast',
            sections: [{ label: 'Breakfast', items: [{ name: 'Toast' }] }],
          },
          { id: 'page-1' }
        )
        return {
          ok: true,
          data: options.mergeParts([part.part], []),
          files: [],
        }
      },
    }
  )
  const result = await extractMenuSourceWithAi(
    {},
    {
      appId: 'app',
      menuId: 'source-123',
      currencyCode: 'CHF',
      sourceFiles: [
        { id: 'page-1', file_name: 'scan.pdf', file_type: 'application/pdf' },
      ],
    }
  )
  assert.equal(result.data.name, 'Breakfast')
  assert.equal(result.data.sections[0].items[0].name, 'Toast')
})

test('review proposes the extracted name, requires confirmation and sends the edited name', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/Menus/Process/Review/Apply.vue',
      import.meta.url
    ),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const props = reactive({
    source: {
      id: 'source-123',
      ai_draft: { name: 'Lunch', sections: [{ items: [{ name: 'Soup' }] }] },
    },
    appId: 'app',
    kitchenId: 'venue',
    menuId: 'source-123',
    authToken: 'token',
  })
  const bodies = [],
    scope = effectScope()
  const deps = {
    computed,
    ref,
    watch,
    defineProps: () => props,
    defineEmits: () => () => {},
    useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
    fetch: async (_, options) => {
      bodies.push(JSON.parse(options.body))
      return { ok: true, json: async () => ({ ok: true }) }
    },
  }
  const review = scope.run(() =>
    compileFunction(
      stripTypeScriptTypes(source) +
        ';return {reviewedName,canConfirm,confirmDraft}',
      Object.keys(deps)
    )(...Object.values(deps))
  )
  assert.equal(review.reviewedName.value, 'Lunch')
  review.reviewedName.value = ''
  assert.equal(review.canConfirm.value, false)
  review.reviewedName.value = 'Wedding buffet'
  await review.confirmDraft()
  assert.equal(bodies[0].name, 'Wedding buffet')
  assert.equal(bodies[0].uploadId, 'source-123')
  assert.equal(props.source.ai_draft.name, 'Lunch')
  scope.stop()
})

test('new imports require a reviewed name; existing Menu identity stays stable', async () => {
  let existing,
    collision = false
  const writes = []
  const { writeKitchenMenuDraft } = loadOfferingSource(
    'menu/server/draft/write',
    'writeKitchenMenuDraft',
    {
      createError: ({ statusMessage }) => new Error(statusMessage),
      normalizeSlug: (value) => value.toLowerCase().replace(/\s+/g, '-'),
      MenuStorage: { scopeCollection: 'menus' },
      getRuntimeFirestore: () => ({
        doc: () => ({
          collection: () => ({ get: async () => ({ docs: [] }) }),
        }),
      }),
      serverAuditStamp: () => ({}),
      planKitchenMenuDraft: () => ({
        plannedSections: [],
        sproochliCacheUnits: [],
      }),
      serverKitchenMenusTarget: () => 'menus',
      serverKitchenDishesTarget: () => 'dishes',
      requireMenuCreationCapacity: async () => ({ subscription: 'business' }),
      requireKitchenMutationAuthority: async () => ({}),
      requireAvailableMenuSlug: async () => {
        if (collision) throw new Error('Already exists')
      },
      replaceKitchenMenuDraftContent: () => {},
      runGuardedServerTransaction: async (_, work) =>
        work({
          read: async () => ({ exists: Boolean(existing), data: existing }),
          readMany: async () => [],
          create: (...args) => writes.push(args),
          update: (...args) => writes.push(args),
        }),
    }
  )
  const input = {
    appId: 'app',
    kitchenId: 'venue',
    kitchenPath: 'kitchens/venue',
    menuId: 'source-123',
    uid: 'actor',
    actor: {},
    sections: [],
  }
  await assert.rejects(writeKitchenMenuDraft(input), /Confirm a Menu name/)
  assert.equal(writes.length, 0)
  await writeKitchenMenuDraft({ ...input, name: 'Sunday lunch' })
  assert.equal(writes[0][2].name, 'Sunday lunch')
  assert.equal(writes[0][2].slug, 'sunday-lunch')
  assert.equal(writes[0][2].status, 'draft')
  collision = true
  await assert.rejects(
    writeKitchenMenuDraft({ ...input, name: 'Sunday lunch' }),
    /Already exists/
  )
  assert.equal(writes.length, 1)
  existing = { name: 'Food', slug: 'stable-food', status: 'published' }
  await writeKitchenMenuDraft({ ...input, name: 'A different suggestion' })
  assert.equal(writes[1][2].name, 'Food')
  assert.equal(writes[1][2].slug, 'stable-food')
  assert.equal(writes[1][2].status, 'published')
})
