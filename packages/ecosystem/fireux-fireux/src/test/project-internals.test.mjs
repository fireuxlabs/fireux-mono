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
      '../runtime/project/components/Workspace/Home/Intent.vue',
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
          '../runtime/project/components/Workspace/Home/Intent.vue',
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
