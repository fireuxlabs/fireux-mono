import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref } from 'vue'
const runtime = new URL('../runtime/', import.meta.url)
const source = readFileSync(
  new URL('menu/composables/useMenuQrPage.ts', runtime),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.server', 'true')
function fixture(context = 'generic') {
  const state = {
    kitchenSlug: ref('venue'),
    indexPath: ref('/kitchens/venue/menus'),
    menuPath: ref('/kitchens/venue/menus/food'),
    renderKind: ref('structured'),
    document: ref(null),
    manifest: ref({
      content: { name: 'Food' },
      presentation: { kitchenName: 'Venue', kitchenLogoImageUrl: '/logo.png' },
      behaviour: { enabled: true },
    }),
    failure: ref(null),
    pending: ref(false),
    ready: Promise.resolve(),
  }
  const reads = [],
    statuses = []
  let seo
  const deps = {
    computed,
    ref,
    useMenu: (...args) => {
      reads.push(args)
      return state
    },
    useRequestURL: () => new URL('https://example.test'),
    setResponseStatus: (status) => statuses.push(status),
    useSeoMeta: (value) => (seo = value),
    menuManifestSupportsContext: (behaviour) => Boolean(behaviour?.enabled),
  }
  const props = {
    menuId: ' food ',
    menuContext: context,
    menuRouteScope: { kind: 'directory', kitchenSlug: 'venue' },
  }
  const api = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuQrPage(props)`,
    [...Object.keys(deps), 'props']
  )(...Object.values(deps), props)
  return { api, state, reads, statuses, seo }
}
test('public QR coordinator reads once and preserves Menu identity, paths and SEO', async () => {
  const f = fixture()
  await f.api.ready
  assert.equal(f.reads.length, 1)
  assert.equal(f.reads[0][0].value, 'food')
  assert.equal(f.api.menuName.value, 'Food')
  assert.equal(f.api.kitchenName.value, 'Venue')
  assert.equal(
    f.api.menuUrl.value,
    'https://example.test/kitchens/venue/menus/food'
  )
  assert.equal(f.seo.robots, 'noindex, nofollow')
  assert.equal(f.seo.title.value, 'Food QR')
  f.api.applyResponseStatus()
  assert.deepEqual(f.statuses, [])
})
test('loading, missing context and document context keep distinct response outcomes', () => {
  const f = fixture('collection')
  f.state.pending.value = true
  f.state.manifest.value = null
  assert.equal(f.api.qrState.value, 'loading')
  assert.equal(f.api.qrFailure.value, null)
  f.state.pending.value = false
  assert.equal(f.api.qrState.value, 'unavailable')
  f.api.applyResponseStatus()
  assert.deepEqual(f.statuses, [404])
  f.state.renderKind.value = 'document'
  f.state.document.value = { name: 'PDF menu', kitchenName: 'Venue' }
  assert.equal(f.api.qrFailure.value.statusCode, 404)
  const document = fixture()
  document.state.renderKind.value = 'document'
  document.state.manifest.value = null
  document.state.document.value = { name: 'PDF menu' }
  assert.equal(document.api.menuName.value, 'PDF menu')
  assert.equal(document.api.qrFailure.value, null)
  document.api.qrError.value = true
  assert.equal(document.api.qrState.value, 'error')
})
test('print action runs only on the client with a ready code', () => {
  const file = readFileSync(
    new URL('menu/components/QR/PrintAction.vue', runtime),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
  for (const client of [false, true])
    for (const ready of [false, true]) {
      let calls = 0
      const print = compileFunction(
        `${stripTypeScriptTypes(file.replaceAll('import.meta.client', String(client)))}; return printQr`,
        ['defineProps', 'window']
      )(() => ({ ready }), { print: () => calls++ })
      print()
      assert.equal(calls, client && ready ? 1 : 0)
    }
})
