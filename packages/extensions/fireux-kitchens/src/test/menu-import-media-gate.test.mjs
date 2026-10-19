import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL(
    '../runtime/server/api/workspace/kitchen/menus/confirm.post.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(
    'export default defineEventHandler',
    'const defaultHandler = defineEventHandler'
  )
const loadConfirm = (deps) =>
  compileFunction(
    stripTypeScriptTypes(source) + '; return { defaultHandler }',
    Object.keys(deps)
  )(...Object.values(deps))

test('import confirmation needs a media decision only for a detected image', async () => {
  let imageUrl = '',
    writes = 0
  const { defaultHandler: confirm } = loadConfirm({
    defineEventHandler: (handler) => handler,
    requireKitchenMenuUploadUser: async () => 'operator',
    readBody: async () => ({
      kitchenId: 'k',
      menuId: 'm',
      name: 'Test',
      confirmDishes: true,
    }),
    readKitchenMutationActor: async () => ({ runtimeAppId: 'app' }),
    requirePathSegment: (value) => value,
    assertKitchenMenuUploadAccess: async () => {},
    assertKitchenMenuCurrencyCode: async () => 'CHF',
    createError: ({ statusMessage }) => new Error(statusMessage),
    getRuntimeFirestore: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => ({
            ai_draft: {
              sections: [
                {
                  label: 'Food',
                  items: [
                    {
                      name: 'Toast',
                      image_url: imageUrl,
                      price_options: [],
                      add_ons: [],
                    },
                  ],
                },
              ],
            },
          }),
        }),
      }),
    }),
    kitchenMenuUploadPath: () => 'source',
    kitchenMenuUploadKitchenPath: () => 'kitchens/k',
    normalizeKitchenMenuDraftSections: (value) => value.sections,
    countKitchenMenuDraftItems: () => 1,
    normalizeMenuMediaReview: () => ({}),
    menuMediaReviewKey: (section, item) => `${section}:${item}`,
    normalizeSlug: (value) => value.toLowerCase(),
    readKitchenMenuCurrentShape: async () => ({
      menu: { status: 'missing' },
      sections: [],
    }),
    menuNameAndSlug: (_, name) => ({ name }),
    compareKitchenMenuDraftToCurrent: () => ({ flags: [] }),
    writeKitchenMenuDraft: async () => {
      writes++
      return { sproochliCacheUnits: [], dish_targets: [], status: 'draft' }
    },
    importKitchenMenuCacheUnits: async () => ({ status: 'complete' }),
    serverAuditStamp: () => ({ at: 'now' }),
    serverUpdate: async () => {},
    serverKitchenMenuUploadsTarget: () => 'uploads',
    readString: (value) => String(value || ''),
  })
  assert.equal((await confirm({})).ok, true)
  assert.equal(writes, 1)
  imageUrl = 'https://example.com/toast.jpg'
  await assert.rejects(
    confirm({}),
    /Review Dish media before confirming: Toast/
  )
  assert.equal(writes, 1)
})
