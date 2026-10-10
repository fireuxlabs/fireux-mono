import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import {
  computed,
  effectScope,
  onScopeDispose,
  reactive,
  ref,
  watch,
} from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'

function load(path, expression, dependencies, component = false) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  if (component)
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${expression}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function contextSources() {
  const credentials = deferred()
  const currentUser = ref({
    uid: 'actor',
    isAnonymous: false,
    getIdToken: () => credentials.promise,
  })
  const session = {
    appUser: ref({
      role: 'admin',
      created: { at: { seconds: 1, nanoseconds: 0 } },
    }),
  }
  const selectedId = ref('misebox')
  const config = reactive({ appId: 'fireux-app' })
  const route = reactive({ fullPath: '/workspace/project/team' })
  return { credentials, currentUser, session, selectedId, config, route }
}
function roundTrip(fixture, changed) {
  if (changed === 'account') {
    const original = fixture.currentUser.value
    fixture.currentUser.value = { ...original, uid: 'other' }
    fixture.currentUser.value = original
  } else if (changed === 'membership') {
    const original = fixture.session.appUser.value
    fixture.session.appUser.value = null
    fixture.session.appUser.value = original
  } else if (changed === 'selection') {
    fixture.selectedId.value = 'other'
    fixture.selectedId.value = 'misebox'
  } else if (changed === 'app') {
    fixture.config.appId = 'other'
    fixture.config.appId = 'fireux-app'
  } else if (changed === 'route') {
    fixture.route.fullPath = '/elsewhere'
    fixture.route.fullPath = '/workspace/project/team'
  } else fixture.owner.stop()
}

test('Project Test records preserve settled errors and inactive bindings without reporting loading', () => {
  const source = Object.assign(ref(undefined), {
    pending: ref(false),
    error: ref(new Error('Denied')),
    outcome: ref('error'),
  })
  const id = ref('misebox')
  const paths = []
  const read = load(
    '../runtime/project/composables/useProjectTestRecords.ts',
    'useProjectTestRecords',
    {
      computed,
      readRuntimeFirestoreDatabaseId: () => 'fireux',
      useFirestoreRead: () => ({
        firestoreFetchCollection: (path) => {
          paths.push(path)
          return source
        },
      }),
    }
  )(id)
  assert.equal(read.pending.value, false)
  assert.equal(read.error.value.message, 'Denied')
  source.error.value = undefined
  source.outcome.value = 'idle'
  id.value = ''
  assert.equal(read.pending.value, false)
  assert.equal(paths[0].value, '')
  source.pending.value = true
  assert.equal(read.pending.value, true)
  source.pending.value = false
  source.value = []
  source.outcome.value = 'empty'
  assert.deepEqual(read.records.value, [])
  assert.equal(paths.length, 1)
})

function intentFixture() {
  const fixture = contextSources()
  const response = deferred()
  const calls = []
  const dependencies = {
    useAuth: () => ({ currentUser: fixture.currentUser }),
    useAppSession: () => fixture.session,
    useFireUXConfig: () => fixture.config,
    useWorkspace: () => ({ selectedId: fixture.selectedId }),
    useRoute: () => fixture.route,
    useCommandScope,
    useRequireUser: async () => fixture.currentUser.value,
    $fetch: (url, options) => {
      calls.push({ url, options })
      return response.promise
    },
  }
  const owner = effectScope()
  const api = owner.run(() =>
    load(
      '../runtime/project/composables/workspace/ai/useProjectIntent.ts',
      'useProjectIntent',
      dependencies
    )()
  )
  return { ...fixture, response, calls, owner, api }
}
const payload = () => ({
  capability: 'team',
  prompt: 'Rename Alex',
  records: [{ id: 'person', name: 'Alex' }],
  availableActions: ['update'],
})
for (const changed of [
  'account',
  'membership',
  'selection',
  'app',
  'route',
  'disposed',
]) {
  test(`Project AI rejects ${changed} round trips before credential dispatch`, async () => {
    const fixture = intentFixture()
    const flight = fixture.api.request(payload())
    await Promise.resolve()
    roundTrip(fixture, changed)
    fixture.credentials.resolve('token')
    await assert.rejects(flight, /context changed/)
    assert.equal(fixture.calls.length, 0)
    fixture.owner.stop()
  })
  test(`Project AI suppresses ${changed} completion after provider dispatch`, async () => {
    const fixture = intentFixture()
    fixture.credentials.resolve('token')
    const flight = fixture.api.request(payload())
    while (!fixture.calls.length) await Promise.resolve()
    roundTrip(fixture, changed)
    fixture.response.resolve({
      action: 'update',
      name: 'Obsolete',
      message: '',
    })
    await assert.rejects(flight, /context changed/)
    fixture.owner.stop()
  })
}
test('Project AI captures nested input before credentials and preserves the human dialog flow', async () => {
  const fixture = intentFixture()
  const input = payload()
  const emitted = []
  const props = {
    scopeKey: 'misebox:person',
    availableActions: ['update'],
    request: () => fixture.api.request(input),
  }
  const dialog = fixture.owner.run(() =>
    load(
      '../runtime/components/Workspace/Project/Home/Intent.vue',
      '{ submit, prompt }',
      {
        ref,
        watch,
        onBeforeUnmount: () => {},
        defineProps: () => props,
        defineEmits:
          () =>
          (...args) =>
            emitted.push(args),
      },
      true
    )
  )
  dialog.prompt.value = input.prompt
  const flight = dialog.submit()
  input.prompt = 'Changed'
  input.records[0].name = 'Changed'
  input.availableActions.push('delete')
  fixture.credentials.resolve('token')
  while (!fixture.calls.length) await Promise.resolve()
  assert.deepEqual(fixture.calls[0].options.body, payload())
  fixture.response.resolve({ action: 'update', name: 'Review me', message: '' })
  await flight
  assert.deepEqual(emitted, [
    ['action', { action: 'update', name: 'Review me', message: '' }],
  ])
  fixture.owner.stop()
})

function editorFixture() {
  const response = deferred(),
    notices = []
  const identity = {
    canWrite: ref(true),
    publication: ref(null),
    projectId: ref('misebox'),
    name: ref('Before'),
    description: ref(''),
    imageUrl: ref(''),
    update: () => response.promise,
  }
  const owner = effectScope()
  const api = owner.run(() =>
    load(
      '../runtime/project/components/Workspace/Identity/Write.vue',
      '{ show, save, open, saving, error, name }',
      {
        computed,
        ref,
        watch,
        onScopeDispose,
        defineProps: () => ({ identity }),
        defineEmits: () => () => {},
        defineExpose() {},
        useAuth: () => ({ currentUser: ref({ uid: 'actor' }) }),
        useToast: () => ({ add: (notice) => notices.push(notice) }),
      },
      true
    )
  )
  api.show({
    action: 'update',
    name: 'After',
    description: null,
    imageUrl: null,
  })
  return { response, notices, identity, owner, api }
}
for (const changed of ['revoked', 'disposed'])
  for (const completion of ['success', 'error']) {
    test(`Project Identity suppresses ${completion} after ${changed} editor ownership`, async () => {
      const fixture = editorFixture()
      const flight = fixture.api.save()
      if (changed === 'revoked') {
        fixture.identity.canWrite.value = false
        fixture.identity.canWrite.value = true
        fixture.api.show({
          action: 'update',
          name: 'New draft',
          description: null,
          imageUrl: null,
        })
      } else fixture.owner.stop()
      if (completion === 'success') fixture.response.resolve()
      else fixture.response.reject(new Error('Obsolete failure'))
      await flight
      assert.deepEqual(fixture.notices, [])
      assert.equal(fixture.api.error.value, '')
      assert.equal(fixture.api.saving.value, false)
      if (changed === 'revoked') {
        assert.equal(fixture.api.open.value, true)
        assert.equal(fixture.api.name.value, 'New draft')
      }
      fixture.owner.stop()
    })
  }

function appContextFixture() {
  const fixture = contextSources()
  const response = deferred(),
    calls = []
  const state = {
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh() {},
  }
  let handler, key
  const dependencies = {
    computed,
    ref,
    watch,
    onScopeDispose,
    useCommandScope,
    useAuth: () => ({ currentUser: fixture.currentUser }),
    useAppSession: () => fixture.session,
    useFireUXConfig: () => fixture.config,
    useWorkspace: () => ({ selectedId: fixture.selectedId }),
    hasProjectAppContext: (id) => id === 'misebox',
    useAsyncData: (requestKey, run) => {
      key = requestKey
      handler = run
      return state
    },
    $fetch: (url, options) => {
      calls.push({ url, options })
      return response.promise
    },
  }
  const owner = effectScope()
  const api = owner.run(() =>
    load(
      '../runtime/project/composables/workspace/identity/useProjectAppContext.ts',
      'useProjectAppContext',
      dependencies
    )()
  )
  return {
    ...fixture,
    calls,
    response,
    state,
    owner,
    api,
    key,
    run: (signal) => handler({}, { signal }),
  }
}
const published = {
  sourcePath: '/api/fireux/context/product',
  revision: 'revision',
  context: {},
  identity: {
    name: 'Misebox',
    description: 'Published identity',
    imageUrl: 'https://misebox.app/image.png',
    url: 'https://misebox.app',
  },
}
for (const changed of [
  'account',
  'membership',
  'selection',
  'app',
  'disposed',
  'cancelled',
]) {
  test(`Project App context stops ${changed} credentials and rejects stale cached display`, async () => {
    const fixture = appContextFixture()
    const abort = new AbortController()
    fixture.state.data.value = {
      requestKey: fixture.key.value,
      context: published,
    }
    assert.equal(fixture.api.data.value.identity.name, 'Misebox')
    const flight = fixture.run(abort.signal)
    if (changed === 'cancelled') abort.abort()
    else roundTrip(fixture, changed)
    fixture.credentials.resolve('token')
    assert.equal(await flight, null)
    assert.equal(fixture.calls.length, 0)
    if (changed !== 'cancelled') assert.equal(fixture.api.data.value, null)
    fixture.owner.stop()
  })
}
test('Project App context passes Nuxt cancellation and hides pending, failed and obsolete results', async () => {
  const fixture = appContextFixture()
  const abort = new AbortController()
  fixture.credentials.resolve('token')
  const flight = fixture.run(abort.signal)
  while (!fixture.calls.length) await Promise.resolve()
  assert.equal(fixture.calls[0].options.signal, abort.signal)
  abort.abort()
  fixture.response.resolve(published)
  assert.equal(await flight, null)
  fixture.state.data.value = {
    requestKey: fixture.key.value,
    context: published,
  }
  fixture.state.pending.value = true
  assert.equal(fixture.api.data.value, null)
  fixture.state.pending.value = false
  fixture.state.error.value = new Error('Unavailable')
  assert.equal(fixture.api.data.value, null)
  fixture.state.error.value = null
  assert.equal(
    fixture.api.data.value.identity.description,
    'Published identity'
  )
  roundTrip(fixture, 'membership')
  assert.equal(fixture.api.data.value, null)
  assert.equal(fixture.api.publication.value.description, '')
  fixture.owner.stop()
})
test('Project App context preserves a current response and reports a current failure', async () => {
  const fixture = appContextFixture()
  fixture.credentials.resolve('token')
  const flight = fixture.run(new AbortController().signal)
  fixture.response.resolve(published)
  fixture.state.data.value = await flight
  assert.equal(fixture.api.data.value.identity.name, 'Misebox')
  assert.equal(fixture.api.publication.value.description, 'Published identity')
  fixture.owner.stop()
  const failed = appContextFixture()
  failed.credentials.resolve('token')
  const failure = failed.run(new AbortController().signal)
  failed.response.reject(new Error('Provider unavailable'))
  await assert.rejects(failure, /Provider unavailable/)
  failed.owner.stop()
})

for (const changed of ['record', 'actions'])
  for (const completion of ['success', 'error']) {
    test(`Project AI dialog preserves a new request after an old ${completion} and ${changed} round trip`, async () => {
      const props = reactive({
        scopeKey: 'project:member-a',
        availableActions: ['update'],
        request: () => responses[calls++].promise,
      })
      const responses = [deferred(), deferred()],
        emitted = []
      let calls = 0
      const owner = effectScope()
      const dialog = owner.run(() =>
        load(
          '../runtime/components/Workspace/Project/Home/Intent.vue',
          '{ submit, prompt, message, submitting }',
          {
            ref,
            watch,
            onBeforeUnmount() {},
            defineProps: () => props,
            defineEmits:
              () =>
              (...args) =>
                emitted.push(args),
          },
          true
        )
      )
      dialog.prompt.value = 'First request'
      const first = dialog.submit()
      if (changed === 'record') {
        props.scopeKey = 'project:member-b'
        props.scopeKey = 'project:member-a'
      } else {
        props.availableActions = ['read']
        props.availableActions = ['update']
      }
      assert.equal(dialog.submitting.value, false)
      dialog.prompt.value = 'Second request'
      const second = dialog.submit()
      assert.equal(calls, 2)
      if (completion === 'success')
        responses[0].resolve({
          action: 'update',
          name: 'Obsolete',
          message: '',
        })
      else responses[0].reject(new Error('Obsolete error'))
      await first
      assert.deepEqual(emitted, [])
      assert.equal(dialog.message.value, '')
      assert.equal(dialog.submitting.value, true)
      responses[1].resolve({ action: 'update', name: 'Current', message: '' })
      await second
      assert.deepEqual(emitted, [
        ['action', { action: 'update', name: 'Current', message: '' }],
      ])
      assert.equal(dialog.submitting.value, false)
      owner.stop()
    })
  }
