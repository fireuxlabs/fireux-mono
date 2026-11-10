import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { loadOfferingSource as load } from './offering-test-helpers.mjs'
import { menuFilePreviewDependencies } from './menu-file-preview-test-helpers.mjs'
const runtime = new URL('../runtime/', import.meta.url)
const sourcePath = 'kitchen/components/Menu/Menus/Uploads/Detail/File.vue'
const documentPath = 'kitchen/components/Menu/Menus/Detail/Document.vue'
const identity = load(
  'menu/utils/records/file-identity',
  'menuSourceFileEntries,menuSourceFileIdentity,menuDocumentFileIdentity'
)
const settle = () => new Promise((resolve) => setImmediate(resolve))
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const source = () => ({
  id: 'source',
  source_url: '',
  input_fingerprint: 'v1',
  file_url: 'https://legacy.invalid/token',
  files: [
    {
      id: 'one',
      file_name: 'First page.jpg',
      file_type: 'image/jpeg',
      file_kind: 'photo',
      storage_path: 'private/one',
      file_url: 'https://storage.invalid/one?token=secret',
      sort_order: 0,
    },
    {
      id: 'two',
      file_name: 'Second page.pdf',
      file_type: 'application/pdf',
      file_kind: 'pdf',
      storage_path: 'private/two',
      file_url: 'https://storage.invalid/two?token=secret',
      sort_order: 1,
    },
  ],
})
function component(path, dependencies) {
  const filename = new URL(path, runtime).pathname
  const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
  const script = compileScript(descriptor, {
    id: filename,
    inlineTemplate: true,
  })
  const code = ts.transpileModule(script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const exports = {}
  compileFunction(code, ['require', 'exports'])((id) => {
    if (id === 'vue') return Vue
    if (id.endsWith('file-identity')) return identity
    if (id.endsWith('useAuth'))
      return { useAuth: () => ({ currentUser: Vue.ref({ uid: 'actor' }) }) }
    if (id.endsWith('useMenuFilePreview')) return dependencies
    if (id.endsWith('useKitchenMenuRecordContext')) return dependencies
    throw Error(id)
  }, exports)
  return exports.default
}
async function rendered(path, props, url) {
  const preview = {
    url: Vue.ref(url),
    pending: Vue.ref(props.readAvailable !== false && !url),
    error: Vue.ref(''),
    retry() {},
  }
  const menu = Vue.ref({
    id: 'menu',
    status: 'archived',
    name: 'Archive',
    doc: {
      url: 'https://storage.invalid/document?token=secret',
      name: 'Original.pdf',
      type: 'application/pdf',
      storage_path: 'private/doc',
    },
  })
  const captured = []
  const C = component(path, {
    useMenuFilePreview: (options) => {
      captured.push(options)
      return preview
    },
    useKitchenMenuRecordContext: () => ({
      menu,
      menuId: Vue.ref('menu'),
      kitchenId: Vue.ref('kitchen'),
      outcome: Vue.ref('ready'),
      canWrite: Vue.ref(false),
    }),
  })
  const app = Vue.createSSRApp({ render: () => Vue.h(C, props) })
  for (const name of ['UCard', 'UAlert'])
    app.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          Vue.h('section', [
            slots.header?.(),
            slots.default?.(),
            slots.description?.(),
          ]),
    })
  app.component('UButton', {
    props: ['to', 'label'],
    setup:
      (p, { slots }) =>
      () =>
        Vue.h('a', { href: p.to }, p.label || slots.default?.()),
  })
  app.component('KitchenMenuMenusCreateUpload', { render: () => null })
  app.component('MenuDetailDocumentViewer', {
    props: ['menu', 'documentUrl'],
    setup: (p) => () => {
      assert.ok(p.documentUrl.startsWith('blob:'))
      assert.equal(p.menu.file.url, p.documentUrl)
      return Vue.h('iframe', { src: p.documentUrl })
    },
  })
  return { html: await renderToString(app), captured }
}
for (const path of [sourcePath, documentPath])
  test(`${path} never mounts the fallback Viewer before protected bytes are ready`, async () => {
    const props = {
      kitchenId: 'kitchen',
      sourceId: 'source',
      source: source(),
      readAvailable: true,
    }
    const pending = await rendered(path, props, '')
    assert.doesNotMatch(
      pending.html,
      /iframe|https:\/\/storage|private\/|token=|\/api\/menus/
    )
    const loaded = await rendered(path, props, 'blob:protected')
    assert.match(loaded.html, /src="blob:protected"/)
    assert.doesNotMatch(
      loaded.html,
      /https:\/\/storage|private\/|token=|\/api\/menus/
    )
    assert.equal(
      loaded.captured[0].enabled(),
      true,
      'readable archived Menu can still be inspected'
    )
  })

test('unavailable source reads do not offer a retry that cannot run', async () => {
  const result = await rendered(
    sourcePath,
    {
      kitchenId: 'kitchen',
      sourceId: 'source',
      source: source(),
      readAvailable: false,
    },
    ''
  )
  assert.doesNotMatch(result.html, /Try again|<iframe/)
  assert.equal(result.captured[0].enabled(), false)
})

test('external source URLs remain links without acquiring protected uploaded bytes', async () => {
  const result = await rendered(
    sourcePath,
    {
      kitchenId: 'kitchen',
      sourceId: 'source',
      source: { ...source(), source_url: 'https://restaurant.example/menu' },
      readAvailable: true,
    },
    ''
  )
  assert.match(result.html, /href="https:\/\/restaurant.example\/menu"/)
  assert.equal(result.captured[0].enabled(), false)
})

function sourceFixture() {
  const lifetime = Vue.effectScope(),
    requests = [],
    created = [],
    revoked = [],
    started = [deferred(), deferred()]
  const props = Vue.reactive({
    kitchenId: 'kitchen',
    sourceId: 'source',
    source: source(),
    readAvailable: true,
  })
  const currentUser = Vue.ref({
      uid: 'actor',
      getIdToken: async () => 'fixture-token',
    }),
    appUser = Vue.ref({ created: { at: 1 } }),
    config = Vue.reactive({ appId: 'app' })
  const deps = {
    ...Vue,
    ...identity,
    useCommandScope,
    defineProps: () => props,
    useAuth: () => ({ currentUser }),
    useUserSession: () => ({ appUser }),
    useFireUXConfig: () => config,
    URL: {
      createObjectURL: (blob) => {
        created.push(blob)
        return `blob:${created.length}`
      },
      revokeObjectURL: (url) => revoked.push(url),
    },
    $fetch: (path, options) => {
      const request = { path, options, ...deferred() }
      requests.push(request)
      started[requests.length - 1]?.resolve()
      return request.promise
    },
  }
  Object.assign(
    deps,
    load('menu/composables/useMenuEditorScope', 'useMenuEditorScope', deps)
  )
  Object.assign(deps, menuFilePreviewDependencies(deps))
  const script = readFileSync(new URL(sourcePath, runtime), 'utf8')
    .match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const state = lifetime.run(() =>
    compileFunction(
      stripTypeScriptTypes(script) +
        ';return {preview,fileChoice,selectedFile}',
      Object.keys(deps)
    )(...Object.values(deps))
  )
  return {
    lifetime,
    props,
    currentUser,
    requests,
    revoked,
    started,
    ...state,
    deps,
  }
}
test('multiple uploaded files select their exact protected identity and revoke the previous Blob', async () => {
  const h = sourceFixture()
  await h.started[0].promise
  assert.equal(h.requests.length, 1)
  const first = h.requests[0]
  assert.equal(first.path, '/api/workspace/kitchen/menus/source-file')
  assert.deepEqual(first.options.body, {
    kitchenId: 'kitchen',
    sourceId: 'source',
    fileId: 'one',
    expectedRevision: await h.deps.menuFileRevision(
      identity.menuSourceFileIdentity(h.props.source, 'one')
    ),
  })
  assert.doesNotMatch(
    JSON.stringify(first.options.body),
    /storage|token=|private\//
  )
  first.resolve(new Blob(['first']))
  await settle()
  assert.equal(h.preview.url.value, 'blob:1')
  h.fileChoice.value = 'two'
  assert.equal(h.preview.url.value, '')
  assert.deepEqual(h.revoked, ['blob:1'])
  await h.started[1].promise
  assert.equal(h.requests[1].options.body.fileId, 'two')
  h.requests[1].resolve(new Blob(['second']))
  await settle()
  assert.equal(h.preview.url.value, 'blob:2')
  h.props.readAvailable = false
  assert.deepEqual(h.revoked, ['blob:1', 'blob:2'])
  await settle()
  assert.equal(h.requests.length, 2)
  h.lifetime.stop()
})

test('changing source during credential acquisition prevents obsolete protected dispatch', async () => {
  const h = sourceFixture(),
    token = deferred()
  h.currentUser.value.getIdToken = () => token.promise
  await settle()
  h.props.readAvailable = false
  token.resolve('fixture-token')
  await settle()
  assert.equal(h.requests.length, 0)
  assert.equal(h.preview.url.value, '')
  h.lifetime.stop()
})
