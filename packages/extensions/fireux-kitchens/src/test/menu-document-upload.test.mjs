import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = stripTypeScriptTypes(
  readFileSync(
    new URL(
      '../runtime/server/api/workspace/kitchen/menus/document-upload.post.ts',
      import.meta.url
    ),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace('export default ', 'return ')
function harness({ files = [{}], denied = false, saveFails = false } = {}) {
  const calls = []
  const dependencies = {
    defineEventHandler: (fn) => fn,
    createError: (value) => new Error(value.statusMessage),
    setKitchenMenuUploadCors: () => {},
    requireKitchenMenuUploadUser: async () => 'actor',
    readKitchenMenuUploadRequest: async () => ({
      appId: 'app',
      kitchenId: 'kitchen',
      uploadId: 'menu',
      files,
    }),
    assertKitchenMenuUploadAccess: async () => {
      if (denied) throw new Error('Denied')
    },
    saveKitchenDocumentMenu: async (_event, input) => {
      calls.push(['save', input])
      if (saveFails) throw new Error('Changed authority')
      return {
        menuId: 'menu',
        document: {
          url: 'https://files/menu.pdf',
          name: 'menu.pdf',
          type: 'application/pdf',
        },
      }
    },
  }
  return {
    calls,
    run: compileFunction(
      source,
      Object.keys(dependencies)
    )(...Object.values(dependencies)),
  }
}
test('Workspace document upload delegates once to the shared Menu file command and preserves its response', async () => {
  const h = harness()
  const result = await h.run({})
  assert.deepEqual(h.calls, [
    [
      'save',
      {
        kitchenId: 'kitchen',
        menuId: 'menu',
        files: [{}],
      },
    ],
  ])
  assert.deepEqual(result, {
    ok: true,
    id: 'menu',
    url: 'https://files/menu.pdf',
    file_name: 'menu.pdf',
    file_type: 'application/pdf',
  })
})
test('denied access and multiple files cannot upload or attach', async () => {
  for (const input of [{ denied: true }, { files: [{}, {}] }]) {
    const h = harness(input)
    await assert.rejects(h.run({}))
    assert.deepEqual(h.calls, [])
  }
})
test('a shared command failure remains a failure at the Workspace adapter', async () => {
  const h = harness({ saveFails: true })
  await assert.rejects(h.run({}), /Changed authority/)
  assert.equal(h.calls.length, 1)
})
