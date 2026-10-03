import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { toValue, ref, watch } from 'vue'
const scopeSource=readFileSync(new URL('../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',import.meta.url),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'')
const useCommandScope=compileFunction(`${stripTypeScriptTypes(scopeSource)};return useCommandScope`,['watch','onScopeDispose'])(watch,()=>{})
import test from 'node:test'

test('brand image commands keep sparse fields, operator authority and live publication', async () => {
  const source = readFileSync(new URL('../runtime/place/composables/firestore/mutations/usePlaceUpdate.ts', import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  const writes = []
  const published = []
  const useUpdate = compileFunction(`${stripTypeScriptTypes(source)}; return usePlaceUpdate`, [
    'useAuth', 'useFireUXConfig', 'useUserSession', 'useRoute', 'useCommandScope', 'useRequireUser', 'toValue', 'usePlaceDetailState', 'normalizePlaceBusinessHours', 'normalizeHexColor', '$fetch',
  ])(
    () => ({currentUser:ref({uid:'actor'})}), () => ({appId:'app'}), () => ({appUser:ref({role:'admin'}),appPending:ref(false),appError:ref(null),appOutcome:ref('ready')}), () => ({fullPath:'/edit'}), useCommandScope,
    async () => ({ uid:'actor', getIdToken: async () => 'test-token' }), toValue,
    () => ({ publish: (response) => published.push(response) }), (value) => value, (value) => value,
    async (url, request) => { writes.push({ url, request }); return { place: { id: 'venue', ...request.body.patch } } },
  )
  const update = useUpdate({ authority: () => ({ appId: 'app', kitchenId: 'venue' }) })
  await update.updateLogoImage('https://example.test/logo.png', { id: 'venue' })
  await update.updateWordmarkImage('', { id: 'venue' })
  await update.updatePlaceImage('https://example.test/profile.png', { id: 'venue' })
  assert.deepEqual(writes.map(({ request }) => request.body), [
    { patch: { logo_image: 'https://example.test/logo.png' }, app_id: 'app', kitchen_id: 'venue' },
    { patch: { wordmark_image: null }, app_id: 'app', kitchen_id: 'venue' },
    { patch: { image_url: 'https://example.test/profile.png' }, app_id: 'app', kitchen_id: 'venue' },
  ])
  assert.ok(writes.every(({ url, request }) => url === '/api/places/venue' && request.method === 'PATCH' && request.headers.Authorization === 'Bearer test-token'))
  assert.equal(published.length, 3)
})
