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
function harness({ files = [{}], denied = false, updateFails = false } = {}) {
  const calls = []
  const dependencies = {
    defineEventHandler: (fn) => fn,
    createError: (value) => new Error(value.statusMessage),
    randomUUID: () => 'unique-file-scope',
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
    saveKitchenMenuUploadFiles: async (input) => {
      calls.push(['upload', input])
      return [
        {
          fileUrl: 'https://files/menu.pdf',
          fileName: 'menu.pdf',
          contentType: 'application/pdf',
          objectPath: 'unique/menu.pdf',
        },
      ]
    },
    updateKitchenMenu: async (_event, input) => {
      if (updateFails) throw new Error('Changed authority')
      calls.push(['update', input])
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
test('document upload attaches one file through the Menu command without overwriting the old file', async () => {
  const h = harness()
  await h.run({})
  assert.equal(h.calls[0][1].uploadId, 'unique-file-scope')
  assert.deepEqual(h.calls[1][1], {
    kitchenId: 'kitchen',
    menuId: 'menu',
    changes: {
      doc: {
        url: 'https://files/menu.pdf',
        name: 'menu.pdf',
        type: 'application/pdf',
        storage_path: 'unique/menu.pdf',
      },
    },
  })
})
test('denied access and multiple files cannot upload or attach', async () => {
  for (const input of [{ denied: true }, { files: [{}, {}] }]) {
    const h = harness(input)
    await assert.rejects(h.run({}))
    assert.deepEqual(h.calls, [])
  }
})
test('changed command authority reports failure after upload without deleting the previous file', async () => {
  const h = harness({ updateFails: true })
  await assert.rejects(h.run({}), /Changed authority/)
  assert.equal(h.calls.length, 1)
})
