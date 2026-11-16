import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue, watch, effectScope } from 'vue'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'

function load(path, result, bindings) {
  const source = readFileSync(
    new URL(`../runtime/${path}`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}

test('hidden Kitchen live projection rechecks exact bearer membership before acquiring data', async () => {
  let role = 'admin',
    reads = 0
  const watched = []
  const sources = {
    watch: (value, options) => {
      watched.push([value.path, options])
      return value
    },
  }
  const db = {
    doc: (path) => ({
      path,
      get: async () => ({ exists: true, data: () => ({ role }) }),
    }),
  }
  const projection = load('server/api/kitchens/index.get.ts', 'handler', {
    defineLiveProjection: (definition) => definition,
    getQuery: (event) => event.query,
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    useFireUXConfig: () => ({ appId: 'misebox', developerId: 'developer' }),
    requireFirebaseBearerUser: async () => ({ uid: 'actor' }),
    getRuntimeFirestore: () => db,
    setResponseHeaders: () => {},
    readKitchens: async (_input, supplied) => {
      assert.equal(supplied, sources)
      reads++
      return [{ id: 'hidden' }]
    },
  })
  const event = { query: { includeHidden: 'true' } }
  assert.equal(projection.access(event), 'protected')
  assert.equal(projection.access({ query: {} }), 'public')
  assert.deepEqual(await projection.read(event, sources), [{ id: 'hidden' }])
  role = 'user'
  await assert.rejects(projection.read(event, sources), { statusCode: 403 })
  assert.equal(
    reads,
    1,
    'revoked admin cannot acquire or retain hidden projection'
  )
  assert.deepEqual(
    watched,
    Array.from({ length: 2 }, () => [
      'apps/misebox/users/actor',
      { authority: true },
    ])
  )
})

test('Kitchen browser reader acquires through the supplied Core fetch and keeps exact Place scope', async () => {
  const placeId = ref('one'),
    calls = []
  let handler, state
  const dispose = []
  const useKitchens = load(
    'kitchen/composables/useKitchens.ts',
    'useKitchens',
    {
      computed,
      toValue,
      watch,
      resolveReadOutcome,
      onMounted: () => {},
      onUnmounted: (fn) => dispose.push(fn),
      useApiRead: (_key, supplied) => {
        handler = supplied
        state = {
          data: ref([]),
          pending: ref(false),
          error: ref(null),
          refresh: async () => {},
          then: (fn) => Promise.resolve().then(fn),
        }
        return state
      },
    }
  )
  const scope = effectScope()
  const reader = scope.run(() => useKitchens({ placeId }))
  const fetch = async (url) => {
    calls.push(url)
    return [{ id: placeId.value }]
  }
  state.data.value = await handler({ fetch })
  assert.equal(reader.collection.value[0].id, 'one')
  placeId.value = 'two'
  assert.deepEqual(
    reader.collection.value,
    [],
    'old Place rows are not presented in new scope'
  )
  state.data.value = await handler({ fetch })
  assert.equal(reader.collection.value[0].id, 'two')
  placeId.value = ''
  assert.deepEqual(await handler({ fetch }), [])
  assert.deepEqual(calls, [
    '/api/kitchens?placeId=one',
    '/api/kitchens?placeId=two',
  ])
  scope.stop()
  dispose.forEach((fn) => fn())
})

test('Menu translation source collector follows Default and complete-cache branches without provider generation', async () => {
  const sources = { watch: (value) => value },
    calls = []
  const resolveMenuSproochli = load(
    'menu/server/sproochli/resolve.ts',
    'resolveMenuSproochli',
    {
      normalizeSproochliLanguage: (value) => value,
      resolveMenuBrowseSurfaceCopy: () => ({}),
      MENU_BROWSE_SURFACE_COPY_FIELDS: [],
      resolveSproochliHostStorage: () => ({ target: { appId: 'app' } }),
      readSproochliMenuTranslationCacheLanguages: async (input) => {
        assert.equal(input.sources, sources)
        calls.push('languages')
        return ['de']
      },
      readSproochliMenuTranslationCache: async (input) => {
        assert.equal(input.sources, sources)
        calls.push('cache')
        return new Map([['menu:specials:name', 'Spezial']])
      },
      readSproochliTranslationMemory: () => {
        throw new Error('complete cache must not read memory')
      },
      resolveSproochliMenu: () => {
        throw new Error('must not generate')
      },
    }
  )
  const menu = {
    content: { id: 'specials', name: 'Special', description: '', sections: [] },
    source: { kitchenId: 'k' },
  }
  const original = structuredClone(menu)
  const defaultMenu = await resolveMenuSproochli(menu, '', 'mixed', sources)
  assert.equal(defaultMenu.sproochli.state, 'default')
  assert.deepEqual(calls, ['languages'])
  calls.length = 0
  const translated = await resolveMenuSproochli(menu, 'de', 'mixed', sources)
  assert.equal(translated.content.name, 'Spezial')
  assert.equal(translated.sproochli.state, 'translated')
  assert.deepEqual(calls, ['languages', 'cache'])
  assert.deepEqual(menu, original)
  assert.equal(JSON.stringify(translated).includes('sources'), false)
})
