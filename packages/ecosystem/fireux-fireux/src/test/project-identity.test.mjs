import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch, nextTick, toValue, onScopeDispose } from 'vue'
import test from 'node:test'

const sharedSource = readFileSync(
  new URL(
    '../../../../core/fireux-core/src/runtime/composables/fireux/useIdentity.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import.*\n/gm, '')
  .replace(/^export /gm, '')
const sharedIdentity = compileFunction(
  `${stripTypeScriptTypes(sharedSource)}; return useIdentity`,
  ['computed']
)(computed)
const source = readFileSync(
  new URL(
    '../runtime/project/composables/useProjectIdentity.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
function harness(publication = null) {
  const writes = [],
    published = []
  const access = { canWrite: ref(true) }
  const workspace = {
    id: ref('p'),
    data: ref({
      id: 'p',
      identity: {
        name: 'Before',
        description: '',
        image_url: '',
        status: 'active',
      },
    }),
    outcome: ref('ready'),
    crud: { update: async (fields) => writes.push(fields) },
  }
  const useIdentity = compileFunction(
    `${stripTypeScriptTypes(source)}; return useProjectIdentity`,
    [
      'useIdentity',
      'computed',
      'toValue',
      'watchEffect',
      'normalizeString',
      'useProjectWorkspace',
      'useProjectAccess',
      'useWorkspacePageState',
    ]
  )(
    sharedIdentity,
    computed,
    toValue,
    (fn) => fn(),
    (value) => String(value || '').trim(),
    () => workspace,
    () => ({ ids: computed(() => (access.canWrite.value ? ['p'] : [])) }),
    () => ({ publish: (value) => published.push(value) })
  )
  return {
    identity: useIdentity({ publication }),
    workspace,
    access,
    writes,
    published,
  }
}
const draft = {
  projectId: 'p',
  name: ' After  Name ',
  description: ' Notes ',
  imageUrl: 'https://example.com/logo.png',
}
test('Identity updates only its bounded fields and publishes no full Project or Team', async () => {
  const h = harness()
  await h.identity.update(draft)
  assert.deepEqual(h.writes, [
    { name: 'After Name', description: 'Notes', image_url: draft.imageUrl },
  ])
  assert.equal(
    h.published.length,
    0,
    'Reusable identity controller must not overwrite the caller page context'
  )
})
test('Identity rejects lost management access and changed selection', async () => {
  const h = harness()
  h.access.canWrite.value = false
  await assert.rejects(h.identity.update(draft), /management access/)
  h.access.canWrite.value = true
  await assert.rejects(
    h.identity.update({ ...draft, projectId: 'other' }),
    /selected Project changed/
  )
  assert.equal(h.writes.length, 0)
})
test('Identity validates names and image URLs but allows clearing an image', async () => {
  const h = harness()
  for (const invalid of [
    { name: ' ' },
    { name: 'x'.repeat(121) },
    { description: 'x'.repeat(2001) },
    { imageUrl: 'javascript:alert(1)' },
    { imageUrl: 'https://user:password@example.com/image.png' },
  ])
    await assert.rejects(h.identity.update({ ...draft, ...invalid }))
  assert.equal(h.writes.length, 0)
  await h.identity.update({ ...draft, imageUrl: '' })
  assert.equal(h.writes[0].image_url, '')
})
test('Identity disables writes when a stale Project is retained under a new selected id', () => {
  const h = harness()
  h.workspace.id.value = 'other'
  assert.equal(h.identity.canWrite.value, false)
})

test('AI prefill preserves untouched identity fields and only saves through human confirmation', async () => {
  const script = readFileSync(
    new URL(
      '../runtime/project/components/Workspace/Identity/Write.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  const saved = []
  const identity = {
    canWrite: ref(true),
    publication: ref(null),
    projectId: ref('p'),
    name: ref('Before'),
    description: ref('Keep this'),
    imageUrl: ref('https://example.com/image.png'),
    update: async (input) => saved.push(input),
  }
  const api = compileFunction(
    `${stripTypeScriptTypes(script)}; return { show, save, name, description, imageUrl }`,
    [
      'computed',
      'ref',
      'watch',
      'onScopeDispose',
      'defineProps',
      'defineEmits',
      'defineExpose',
      'useToast',
      'useAuth',
    ]
  )(
    computed,
    ref,
    watch,
    onScopeDispose,
    () => ({ identity }),
    () => () => {},
    () => {},
    () => ({ add() {} }),
    () => ({ currentUser: ref({ uid: 'operator' }) })
  )
  api.show({
    action: 'update',
    name: 'After',
    description: null,
    imageUrl: null,
    message: '',
  })
  assert.equal(api.name.value, 'After')
  assert.equal(api.description.value, 'Keep this')
  assert.equal(api.imageUrl.value, identity.imageUrl.value)
  assert.equal(saved.length, 0)
  await api.save()
  assert.equal(saved.length, 1)
  api.show({
    action: 'update',
    name: null,
    description: '',
    imageUrl: '',
    message: '',
  })
  assert.equal(api.description.value, '')
  assert.equal(api.imageUrl.value, '')
})

test('CRUD entry opens the existing identity editor and closes its caller on cancel', async () => {
  const script = readFileSync(
    new URL(
      '../runtime/project/components/Workspace/Identity/Write.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  const requested = ref(false)
  const closed = []
  const identity = {
    canWrite: ref(true),
    publication: ref(null),
    projectId: ref('p'),
    name: ref('Current'),
    description: ref('Existing description'),
    imageUrl: ref(''),
    update: async () => {},
  }
  const props = {
    identity,
    get requestedOpen() {
      return requested.value
    },
  }
  const api = compileFunction(
    `${stripTypeScriptTypes(script)}; return { open, name, description }`,
    [
      'computed',
      'ref',
      'watch',
      'onScopeDispose',
      'defineProps',
      'defineEmits',
      'defineExpose',
      'useToast',
      'useAuth',
    ]
  )(
    computed,
    ref,
    watch,
    onScopeDispose,
    () => props,
    () => (event) => closed.push(event),
    () => {},
    () => ({ add() {} }),
    () => ({ currentUser: ref({ uid: 'operator' }) })
  )
  requested.value = true
  await nextTick()
  assert.equal(api.open.value, true)
  assert.equal(api.name.value, 'Current')
  assert.equal(api.description.value, 'Existing description')
  api.open.value = false
  await nextTick()
  assert.deepEqual(closed, ['close'])
  requested.value = false
  await nextTick()
  identity.canWrite.value = false
  requested.value = true
  await nextTick()
  assert.equal(api.open.value, false)
  assert.deepEqual(closed, ['close', 'close'])
})

test('Connected App owns description and image; Project update writes only its own name', async () => {
  const publication = ref({
    projectId: 'p',
    appName: 'Example App',
    sourceUrl: 'https://example.com/api',
    status: 'ready',
    description: 'Published description',
    imageUrl: 'https://example.com/published.png',
    message: '',
  })
  const h = harness(publication)
  assert.equal(h.identity.description.value, 'Published description')
  assert.equal(h.identity.imageUrl.value, publication.value.imageUrl)
  await h.identity.update({
    ...draft,
    description: publication.value.description,
    imageUrl: publication.value.imageUrl,
  })
  assert.deepEqual(h.writes, [{ name: 'After Name' }])
  await assert.rejects(h.identity.update(draft), /managed by the connected App/)
  publication.value = {
    ...publication.value,
    status: 'error',
    description: '',
    imageUrl: '',
    message: 'Unavailable',
  }
  assert.equal(h.identity.description.value, '')
  assert.equal(h.identity.imageUrl.value, '')
})

test('Identity editor discards stale success/error after account or Project round trips', async () => {
  const script = readFileSync(
    new URL(
      '../runtime/project/components/Workspace/Identity/Write.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  for (const scope of ['project', 'account'])
    for (const outcome of ['success', 'error']) {
      let resolve, reject
      const pending = new Promise((yes, no) => {
        resolve = yes
        reject = no
      })
      const currentUser = ref({ uid: 'u' }),
        notices = []
      const identity = {
        canWrite: ref(true),
        publication: ref(null),
        projectId: ref('p'),
        name: ref('Before'),
        description: ref(''),
        imageUrl: ref(''),
        update: () => pending,
      }
      const deps = {
        computed,
        ref,
        watch,
        onScopeDispose,
        defineProps: () => ({ identity }),
        defineEmits: () => () => {},
        defineExpose() {},
        useAuth: () => ({ currentUser }),
        useToast: () => ({ add: (x) => notices.push(x) }),
      }
      const api = compileFunction(
        `${stripTypeScriptTypes(script)}; return { show, save, error, saving, open }`,
        Object.keys(deps)
      )(...Object.values(deps))
      api.show({
        action: 'update',
        name: 'After',
        description: null,
        imageUrl: null,
      })
      const save = api.save()
      if (scope === 'project') {
        identity.projectId.value = 'other'
        identity.projectId.value = 'p'
      } else {
        currentUser.value = null
        currentUser.value = { uid: 'u' }
      }
      if (outcome === 'success') resolve()
      else reject(new Error('Obsolete failure'))
      await save
      assert.equal(api.open.value, false)
      assert.equal(api.saving.value, false)
      assert.equal(api.error.value, '')
      assert.deepEqual(notices, [])
    }
})
