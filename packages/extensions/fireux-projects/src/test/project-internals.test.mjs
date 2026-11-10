import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import {
  computed,
  effectScope,
  nextTick,
  onScopeDispose,
  reactive,
  ref,
  shallowReactive,
  watch,
} from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { teamIntentRecords } from '../../../../core/fireux-core/src/runtime/workspace/utils/team-intent-records.ts'
import { useIdentityEditor } from '../../../../core/fireux-core/src/runtime/composables/fireux/useIdentityEditor.ts'
import { normalizeString } from '../../../../core/fireux-core/src/runtime/utils/normalize-string.ts'

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
    refreshNuxtData: () =>
      assert.fail('Interpreting a prompt must not refresh the roster'),
    $fetch: async (url, options) => {
      calls.push({ url, options })
      const result = await response.promise
      await options.onResponse?.({ options, response: { ok: true } })
      return result
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

test('Project Team includes the selected person even beyond the interpretation limit', async () => {
  const records = Array.from({ length: 105 }, (_, i) => ({
    id: String(i),
    name: 'Person ' + i,
  }))
  const context = {
    collection: { records },
    selected: records[104],
    derived: { capability: { availableActions: ['delete'] } },
  }
  const request = load(
    '../runtime/project/components/Team/AI.vue',
    'requestAI',
    {
      ref,
      computed,
      watch: () => {},
      teamIntentRecords,
      useWorkspaceDraftHandoff: () => ({}),
      useProjectIntent: () => ({ request: (payload) => payload }),
      defineProps: () => ({ team: { context: ref(context) } }),
      defineEmits: () => () => {},
    },
    true
  )
  const payload = await request('Remove selected')
  assert.equal(payload.selectedId, '104')
  assert.deepEqual(payload.records, [...records.slice(0, 99), records[104]])
  assert.equal(context.collection.records.length, 105)
})

function removalFixture(t) {
  const fixture = contextSources()
  const selection = ref('another-person')
  const calls = []
  const response = deferred()
  const data = ref({
    ok: true,
    project_id: 'misebox',
    members: [{ id: 'reviewed', name: 'Alex' }],
  })
  const owner = effectScope()
  t.after(() => owner.stop())
  const team = owner.run(() =>
    load(
      '../runtime/project/composables/workspace/useProjectWorkspaceTeam.ts',
      'useProjectWorkspaceTeam()',
      {
        computed,
        normalizeString,
        useCommandScope,
        useAuth: () => ({
          currentUser: fixture.currentUser,
          hasAuthState: ref(true),
        }),
        useAppSession: () => ({
          ...fixture.session,
          pending: ref(false),
          error: ref(null),
        }),
        useFireUXConfig: () => fixture.config,
        useProjectWorkspace: () => ({
          data: computed(() => ({
            id: fixture.selectedId.value,
            identity: { name: 'Misebox' },
          })),
          outcome: ref('ready'),
        }),
        useAsyncData: () => ({ data, pending: ref(false), error: ref(null) }),
        useWorkspaceTeam: ({ members }) => ({
          members,
          selectedTeamMemberId: selection,
          derived: ref({}),
        }),
        useWorkspacePageState: () => ({ publish() {} }),
        watchEffect: () => {},
        $fetch: (url, options) => {
          calls.push({ url, options })
          return response.promise
        },
      }
    )
  )
  return {
    ...fixture,
    owner,
    selection,
    calls,
    response,
    remove: team.primitives.delete,
  }
}
for (const changed of [
  'account',
  'membership',
  'selection',
  'disposed',
  'confirmation',
]) {
  test(`Project removal rechecks its reviewed target after ${changed} changes during authentication`, async (t) => {
    const h = removalFixture(t)
    let current = true
    const flight = h.remove('reviewed', () => current)
    if (changed === 'confirmation') current = false
    else roundTrip(h, changed)
    h.credentials.resolve('token')
    await assert.rejects(flight, /changed/)
    assert.equal(h.calls.length, 0)
  })
}
test('Project removal targets the reviewed detail member and validates its response', async (t) => {
  const h = removalFixture(t)
  h.credentials.resolve('token')
  const flight = h.remove('reviewed')
  await Promise.resolve()
  assert.equal(
    h.calls[0].url,
    '/api/internal/control/projects/misebox/team/reviewed'
  )
  assert.equal(h.calls[0].options.method, 'DELETE')
  h.response.resolve({
    ok: true,
    project_id: 'different',
    member_id: 'reviewed',
    name: 'Alex',
  })
  await assert.rejects(flight, /response was invalid/)
  assert.equal(h.selection.value, 'another-person')
})

function editorFixture() {
  const response = deferred(),
    responses = [response, deferred()],
    notices = [],
    updates = [],
    predicates = [],
    emitted = []
  const currentUser = ref({ uid: 'actor' })
  const identity = {
    canWrite: ref(true),
    outcome: ref('ready'),
    publication: ref(null),
    projectId: ref('misebox'),
    name: ref('Before'),
    description: ref(''),
    imageUrl: ref(''),
    projectStatus: ref('inactive'),
    update: (input, isCurrent) => {
      updates.push(input)
      predicates.push(isCurrent)
      return responses[updates.length - 1].promise
    },
  }
  const props = shallowReactive({ identity, requestedOpen: false })
  const owner = effectScope()
  const api = owner.run(() =>
    load(
      '../runtime/project/components/Identity/Write.vue',
      '{ show, save, open, saving, error, draft, changed, sameProject }',
      {
        computed,
        ref,
        watch,
        onScopeDispose,
        useIdentityEditor,
        defineProps: () => props,
        defineEmits:
          () =>
          (...args) =>
            emitted.push(args),
        defineExpose() {},
        useAuth: () => ({ currentUser }),
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
  return {
    response,
    responses,
    notices,
    updates,
    predicates,
    emitted,
    identity,
    props,
    currentUser,
    owner,
    api,
  }
}
test('Project Identity coordinates stored status and activation without broadening selected-record access', async () => {
  const calls = [],
    predicates = []
  const workspace = {
    id: ref('project'),
    data: ref({
      id: 'project',
      identity: {
        name: 'Project',
        description: '',
        image_url: '',
        status: 'inactive',
      },
    }),
    outcome: ref('ready'),
    access: { ids: ref(['project']) },
  }
  const useIdentity = load(
    '../../../../core/fireux-core/src/runtime/composables/fireux/useIdentity.ts',
    'useIdentity',
    { computed }
  )
  const useWorkspaceIdentity = load(
    '../../../../core/fireux-core/src/runtime/workspace/composables/useWorkspaceIdentity.ts',
    'useWorkspaceIdentity',
    { computed, useIdentity }
  )
  const identity = load(
    '../runtime/project/composables/workspace/useProjectWorkspaceIdentity.ts',
    'useProjectWorkspaceIdentity()',
    {
      computed,
      normalizeString,
      useWorkspaceIdentity,
      useProjectWorkspace: () => workspace,
      useProjectUpdate: (sources) => {
        assert.equal(sources[0], workspace.id)
        return {
          updateProject: async (input, isCurrent) => {
            calls.push(input)
            predicates.push(isCurrent)
          },
        }
      },
    }
  )
  assert.equal(identity.projectStatus.value, 'inactive')
  const input = {
    projectId: 'project',
    name: 'Project',
    description: '',
    imageUrl: '',
    status: 'active',
  }
  const isCurrent = () => true
  await identity.update(input, isCurrent)
  assert.equal(predicates[0], isCurrent)
  assert.deepEqual(calls, [
    {
      projectId: 'project',
      changes: {
        name: 'Project',
        description: '',
        image_url: '',
        status: 'active',
      },
    },
  ])
  await assert.rejects(
    identity.update({ ...input, status: 'archived' }),
    /active or inactive/
  )
  await assert.rejects(
    identity.update({ ...input, projectId: 'other' }),
    /selected Project changed/
  )
  workspace.access.ids.value = []
  await assert.rejects(identity.update(input), /management access/)
  assert.equal(calls.length, 1)
})
test('Project Identity editor retains stored status and submits activation with the captured Project', async () => {
  const fixture = editorFixture()
  assert.equal(fixture.api.draft.value.status, 'inactive')
  fixture.api.draft.value.status = 'active'
  const flight = fixture.api.save()
  assert.deepEqual(fixture.updates, [
    {
      projectId: 'misebox',
      name: 'After',
      description: '',
      imageUrl: '',
      status: 'active',
    },
  ])
  fixture.response.resolve()
  await flight
  assert.equal(fixture.api.open.value, false)
  assert.equal(fixture.notices.length, 1)
  fixture.owner.stop()
})

test('Project Identity accepts its listener acknowledgement before the save response', async () => {
  const fixture = editorFixture()
  fixture.api.draft.value.name = '  Prepared   name  '
  const flight = fixture.api.save()
  fixture.identity.name.value = 'Prepared name'
  assert.equal(fixture.predicates[0](), true)
  fixture.response.resolve()
  await flight
  assert.equal(fixture.api.open.value, false)
  assert.equal(fixture.api.saving.value, false)
  assert.equal(fixture.notices.length, 1)
  fixture.owner.stop()
})

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
        assert.equal(fixture.api.draft.value.name, 'New draft')
      }
      fixture.owner.stop()
    })
  }

for (const completion of ['success', 'error']) {
  test(`Project Identity preserves a newer AI proposal and save after an old ${completion}`, async () => {
    const fixture = editorFixture()
    const first = fixture.api.save()
    assert.equal(fixture.api.saving.value, true)
    assert.equal(fixture.predicates[0](), true)
    fixture.api.show({
      action: 'update',
      name: 'New AI proposal',
      description: null,
      imageUrl: null,
    })
    assert.equal(fixture.predicates[0](), false)
    assert.equal(fixture.api.saving.value, false)
    const second = fixture.api.save()
    assert.equal(fixture.updates.length, 2)
    assert.equal(fixture.api.saving.value, true)
    assert.equal(fixture.predicates[1](), true)
    if (completion === 'success') fixture.responses[0].resolve()
    else fixture.responses[0].reject(new Error('Obsolete failure'))
    await first
    assert.equal(fixture.api.open.value, true)
    assert.equal(fixture.api.draft.value.name, 'New AI proposal')
    assert.equal(fixture.api.saving.value, true)
    assert.equal(fixture.api.error.value, '')
    assert.deepEqual(fixture.notices, [])
    fixture.responses[1].resolve()
    await second
    assert.equal(fixture.api.open.value, false)
    assert.equal(fixture.api.saving.value, false)
    assert.equal(fixture.notices.length, 1)
    fixture.owner.stop()
  })
}

test('Project Identity prepares manual and AI drafts without conflating null and empty fields', () => {
  const fixture = editorFixture()
  fixture.identity.description.value = 'Stored description'
  fixture.identity.imageUrl.value = 'https://example.com/project.png'
  fixture.api.show()
  assert.equal(fixture.api.draft.value.name, 'Before')
  assert.equal(fixture.api.draft.value.description, 'Stored description')
  assert.equal(fixture.api.changed.value, false)
  fixture.api.show({
    action: 'update',
    name: 'Prepared name',
    description: null,
    imageUrl: '',
  })
  assert.equal(fixture.api.draft.value.name, 'Prepared name')
  assert.equal(fixture.api.draft.value.description, 'Stored description')
  assert.equal(fixture.api.draft.value.imageUrl, '')
  assert.equal(fixture.api.changed.value, true)
  fixture.owner.stop()
})

test('Project requested-open retains its human review and in-flight dismissal behavior', async () => {
  const fixture = editorFixture()
  fixture.api.open.value = false
  await nextTick()
  fixture.props.requestedOpen = true
  await nextTick()
  assert.equal(fixture.api.open.value, true)
  assert.equal(fixture.api.draft.value.name, 'Before')
  assert.equal(fixture.api.changed.value, false)
  fixture.api.draft.value.name = 'Reviewed name'
  const flight = fixture.api.save()
  fixture.props.requestedOpen = false
  await nextTick()
  assert.equal(fixture.api.open.value, true)
  assert.equal(fixture.api.saving.value, true)
  fixture.response.resolve()
  await flight
  assert.equal(fixture.api.open.value, false)
  fixture.identity.canWrite.value = false
  fixture.props.requestedOpen = true
  await nextTick()
  assert.equal(fixture.api.open.value, false)
  assert.ok(fixture.emitted.some(([event]) => event === 'close'))
  fixture.owner.stop()
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
