import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { toValue, ref, watch } from 'vue'
const scopeSource = readFileSync(
  new URL(
    '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[^\n]*\n/gm, '')
  .replace(/^export /gm, '')
const useCommandScope = compileFunction(
  `${stripTypeScriptTypes(scopeSource)};return useCommandScope`,
  ['watch', 'onScopeDispose']
)(watch, () => {})
import test from 'node:test'

test('brand image commands keep sparse fields, operator authority and live publication', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/place/composables/firestore/mutations/usePlaceUpdate.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  const writes = []
  const published = []
  const useUpdate = compileFunction(
    `${stripTypeScriptTypes(source)}; return usePlaceUpdate`,
    [
      'useAuth',
      'useFireUXConfig',
      'useUserSession',
      'useRoute',
      'useCommandScope',
      'useRequireUser',
      'toValue',
      'usePlaceDetailState',
      'normalizePlaceBusinessHours',
      'normalizeHexColor',
      '$fetch',
      'inject',
    ]
  )(
    () => ({ currentUser: ref({ uid: 'actor' }) }),
    () => ({ appId: 'app' }),
    () => ({
      appUser: ref({ role: 'admin' }),
      appPending: ref(false),
      appError: ref(null),
      appOutcome: ref('ready'),
    }),
    () => ({ fullPath: '/edit' }),
    useCommandScope,
    async () => ({ uid: 'actor', getIdToken: async () => 'test-token' }),
    toValue,
    () => ({ publish: (response) => published.push(response) }),
    (value) => value,
    (value) => value,
    async (url, request) => {
      writes.push({ url, request })
      return { place: { id: 'venue', ...request.body.patch } }
    },
    () => undefined
  )
  const update = useUpdate({
    authority: () => ({ appId: 'app', kitchenId: 'venue' }),
  })
  await update.updateLogoImage('https://example.test/logo.png', { id: 'venue' })
  await update.updateWordmarkImage('', { id: 'venue' })
  await update.updatePlaceImage('https://example.test/profile.png', {
    id: 'venue',
  })
  assert.deepEqual(
    writes.map(({ request }) => request.body),
    [
      {
        patch: { logo_image: 'https://example.test/logo.png' },
        app_id: 'app',
        kitchen_id: 'venue',
      },
      { patch: { wordmark_image: null }, app_id: 'app', kitchen_id: 'venue' },
      {
        patch: { image_url: 'https://example.test/profile.png' },
        app_id: 'app',
        kitchen_id: 'venue',
      },
    ]
  )
  assert.ok(
    writes.every(
      ({ url, request }) =>
        url === '/api/places/venue' &&
        request.method === 'PATCH' &&
        request.headers.Authorization === 'Bearer test-token'
    )
  )
  assert.equal(published.length, 3)
})

test('Place editors reuse a parent-domain command and suppress obsolete publication', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/place/composables/firestore/mutations/usePlaceUpdate.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  let current = true,
    resolve
  const calls = [],
    published = []
  const adapter = {
    captureIntent: () => () => current,
    update: (id, patch) => {
      calls.push({ id, patch })
      return new Promise((r) => (resolve = r))
    },
  }
  const deps = {
    inject: () => () => adapter,
    toValue,
    useCommandScope,
    useAuth: () => ({ currentUser: ref({ uid: 'actor' }) }),
    useFireUXConfig: () => ({ appId: 'app' }),
    useRoute: () => ({ fullPath: '/workspace/supplier/identity' }),
    useUserSession: () => ({
      appUser: ref({ role: 'user' }),
      appPending: ref(false),
      appError: ref(null),
      appOutcome: ref('ready'),
    }),
    usePlaceDetailState: () => ({ publish: (value) => published.push(value) }),
    useRequireUser: () => {
      throw Error('The parent command owns credentials')
    },
    $fetch: () => {
      throw Error('Do not use the default Place endpoint')
    },
  }
  const useUpdate = compileFunction(
    `${stripTypeScriptTypes(source)};return usePlaceUpdate`,
    Object.keys(deps)
  )(...Object.values(deps))
  const update = useUpdate(),
    pending = update.updateName('New', { id: 'venue' })
  assert.deepEqual(calls, [{ id: 'venue', patch: { name: 'New' } }])
  current = false
  resolve({ id: 'venue', name: 'New' })
  await pending
  assert.equal(published.length, 0)
})

for (const [component, event, method] of [
  ['Brand', 'upload', 'updateLogoImage'],
  ['Photos', 'uploadCover', 'updateCoverImage'],
  ['Photos', 'uploadGallery', 'updateGalleryImages'],
]) {
  test(`${component} ${event} captures its Place and stops attachment after an obsolete upload`, async () => {
    const vue = readFileSync(
      new URL(
        `../runtime/place/components/Edit/${component}.vue`,
        import.meta.url
      ),
      'utf8'
    )
    const source = vue
      .match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
      .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
      .replace(/^export /gm, '')
    let current = true,
      resolveUpload
    const props = { place: { id: 'a', gallery_images: [] } },
      writes = [],
      uploads = [],
      feedback = []
    const update = (...args) => writes.push(args)
    const deps = {
      ref,
      computed: (value) => ({
        get value() {
          return value()
        },
      }),
      defineProps: () => props,
      useImageStorage: () => ({
        uploadImage: (path) => {
          uploads.push(path)
          return new Promise((r) => (resolveUpload = r))
        },
      }),
      usePlaceUpdate: () => ({
        captureIntent: () => () => current,
        updatePlaceImage: update,
        updateLogoImage: update,
        updateWordmarkImage: update,
        updateCoverImage: update,
        updateGalleryImages: update,
      }),
      useToastify: () => ({
        success: (value) => feedback.push(value),
        error: (value) => feedback.push(value),
      }),
    }
    const exposed = compileFunction(
      `${stripTypeScriptTypes(source)};return { ${event} }`,
      Object.keys(deps)
    )(...Object.values(deps))
    const input = {
      files: [{ type: 'image/png', size: 10 }],
      value: 'selected',
    }
    const pending =
      component === 'Brand'
        ? exposed.upload(
            { key: 'logo_image', path: 'logo', update },
            { target: input }
          )
        : exposed[event]({ target: input })
    assert.equal(uploads.length, 1)
    assert.ok(uploads[0].startsWith('places/a/'))
    current = false
    props.place = { id: 'b', gallery_images: [] }
    resolveUpload('saved-url')
    await pending
    assert.equal(writes.length, 0)
    assert.equal(feedback.length, 0)
  })
}
