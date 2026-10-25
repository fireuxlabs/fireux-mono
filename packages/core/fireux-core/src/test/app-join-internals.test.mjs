import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { compile, computed, createSSRApp, effectScope, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useCommandScope } from '../runtime/composables/fireux/commands/useCommandScope.ts'

function load(file, name, dependencies, component = false) {
  let source = readFileSync(new URL(file, import.meta.url), 'utf8')
  if (component)
    source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \{[^\n]+\}\s*$/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function requestHarness() {
  const scope = effectScope()
  const uid = ref('actor-a')
  const hasAuthState = ref(false)
  const isAuthenticated = ref(false)
  const appUser = ref(null)
  const userPending = ref(false)
  const userError = ref(null)
  const request = Object.assign(ref(null), {
    pending: ref(false),
    error: ref(null),
    outcome: ref('idle'),
  })
  let collectionPath,
    target,
    reads = 0
  const commands = []
  const factory = load(
    '../runtime/app/composables/membership/useAppJoinRequest.ts',
    'useAppJoinRequest',
    {
      computed,
      useCommandScope,
      AppJoinRequestStorage: { collection: 'join-requests' },
      useFireUXConfig: () => ({ appId: 'app-a' }),
      useAuth: () => ({ uid, hasAuthState, isAuthenticated }),
      useUserSession: () => ({
        appUser,
        pending: userPending,
        error: userError,
      }),
      useFirestoreRead: () => ({
        firestoreFetchDoc: (path, id) => {
          reads++
          collectionPath = path
          target = id
          return request
        },
      }),
      runAppUserCommand: async (input) => commands.push(input),
    }
  )
  const state = scope.run(factory)
  const settle = () => {
    hasAuthState.value = true
    isAuthenticated.value = true
    request.outcome.value = 'empty'
  }
  return {
    scope,
    uid,
    hasAuthState,
    isAuthenticated,
    appUser,
    userPending,
    userError,
    request,
    commands,
    state,
    settle,
    get reads() {
      return reads
    },
    get path() {
      return collectionPath.value
    },
    get target() {
      return target.value
    },
  }
}

test('App join request uses one live reader and waits for restored identity and read outcomes', async () => {
  const h = requestHarness()
  try {
    assert.equal(h.reads, 1)
    assert.equal(h.path, '')
    assert.equal(h.state.pending.value, true)
    assert.equal(h.state.canRequest.value, false)
    h.settle()
    assert.equal(h.path, 'apps/app-a/join-requests')
    assert.equal(h.target, 'actor-a')
    assert.equal(h.state.canRequest.value, true)
    await h.state.requestJoinApp()
    assert.deepEqual(h.commands, [{ action: 'request-join' }])
    h.request.value = { id: 'actor-a' }
    h.request.outcome.value = 'ready'
    assert.equal(h.state.hasPendingRequest.value, true)
    assert.equal(h.state.canRequest.value, false)
    h.uid.value = 'actor-b'
    h.request.outcome.value = 'pending'
    h.request.pending.value = true
    assert.equal(h.target, 'actor-b')
    assert.equal(
      h.state.hasPendingRequest.value,
      false,
      'retained old data is not a current request'
    )
    assert.equal(h.state.canRequest.value, false)
    h.request.pending.value = false
    h.request.outcome.value = 'empty'
    assert.equal(h.state.canRequest.value, true)
    h.isAuthenticated.value = false
    assert.equal(h.path, '')
    assert.equal(h.target, '')
    assert.equal(h.reads, 1)
  } finally {
    h.scope.stop()
  }
})

test('App join request failures and membership prevent an uninformed command', async () => {
  const h = requestHarness()
  try {
    h.settle()
    h.request.error.value = new Error('request denied')
    h.request.outcome.value = 'error'
    assert.equal(h.state.error.value.message, 'request denied')
    assert.equal(h.state.canRequest.value, false)
    await assert.rejects(h.state.requestJoinApp(), /loaded/)
    assert.equal(h.commands.length, 0)
    h.request.error.value = null
    h.request.outcome.value = 'empty'
    h.userError.value = new Error('membership denied')
    assert.equal(h.state.canRequest.value, false)
    h.userError.value = null
    h.appUser.value = { role: 'user' }
    assert.equal(h.state.isAppMember.value, true)
    assert.equal(h.state.canRequest.value, false)
  } finally {
    h.scope.stop()
  }
})

test('App join-request rows derive from live records and retain a failed action for retry', async () => {
  const requests = ref([{ id: 'person', user: { display_name: 'Before' } }])
  let finish
  const pending = new Promise((_, reject) => {
    finish = reject
  })
  const factory = load(
    '../runtime/app/composables/membership/useAppJoinRequests.ts',
    'useAppJoinRequests',
    {
      computed,
    }
  )
  const state = factory({
    requests,
    card: computed(() => (user) => ({
      displayName: user.display_name,
      handle: '',
      avatarUrl: '',
      to: '',
    })),
    handleJoinRequests: () => pending,
  })
  const action = state.approve('person')
  assert.equal(
    state.items.value.length,
    1,
    'the list keeps its source while the tool owns pending state'
  )
  requests.value[0].user.display_name = 'After'
  assert.equal(state.items.value[0].title, 'After')
  finish(new Error('not approved'))
  await assert.rejects(action, /not approved/)
  assert.equal(state.items.value.length, 1)
  requests.value = []
  assert.deepEqual(state.items.value, [])
})

test('App join section suppresses completion feedback after an account switch', async () => {
  const scope = effectScope()
  const uid = ref('actor-a')
  const messages = []
  let finish
  const pending = new Promise((resolve) => {
    finish = resolve
  })
  const state = scope.run(() =>
    load(
      '../runtime/app/components/Join/Section.vue',
      '{ submit, submitting }',
      {
        computed,
        ref,
        useFireUXConfig: () => ({ appName: 'App' }),
        useAppJoinRequest: () => ({
          pending: ref(false),
          error: ref(null),
          captureIntent: useCommandScope([uid]),
          isAuthenticated: ref(true),
          isAppMember: ref(false),
          hasPendingRequest: ref(false),
          canRequest: ref(true),
          requestJoinApp: () => pending,
        }),
        useToastify: () => ({
          success: (message) => messages.push(message),
          error: (message) => messages.push(message),
        }),
      },
      true
    )
  )
  try {
    const action = state.submit()
    assert.equal(state.submitting.value, true)
    uid.value = 'actor-b'
    finish()
    await action
    assert.deepEqual(messages, [])
    assert.equal(state.submitting.value, false)
  } finally {
    scope.stop()
  }
})

test('App join surface renders an existing failure ahead of a concurrent pending read', async () => {
  const template = readFileSync(
    new URL('../runtime/app/components/Join/Section.vue', import.meta.url),
    'utf8'
  ).match(/<template>([\s\S]*?)<\/template>/)[1]
  const app = createSSRApp({
    setup: () => ({
      pending: true,
      error: new Error('Session unavailable'),
      description: '',
      isAuthenticated: false,
      canRequest: false,
      hasPendingRequest: false,
      isAppMember: false,
      submitting: false,
      authTo: '/auth',
      submit() {},
    }),
    render: compile(template),
  })
  app.component('UPageCard', {
    setup:
      (_, { slots }) =>
      () =>
        h('section', slots.default?.()),
  })
  app.component('FireStateCard', {
    props: ['state', 'loading'],
    setup: (props) => () =>
      h('p', props.state === 'error' ? 'Read failed' : 'Loading'),
  })
  app.component('UButton', { render: () => h('button') })
  app.component('UBadge', { render: () => h('span') })
  const html = await renderToString(app)
  assert.ok(html.includes('Read failed'))
  assert.ok(!html.includes('Loading'))
})
