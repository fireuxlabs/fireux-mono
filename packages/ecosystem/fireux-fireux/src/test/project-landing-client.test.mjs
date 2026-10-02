import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes, createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const repo = new URL('../../../../../', import.meta.url)
const require = createRequire(
  new URL('packages/core/fireux-core/package.json', repo)
)
const { computed, reactive, ref, watch } = require('vue')
const source = (path) => readFileSync(new URL(path, repo), 'utf8')
const core = 'packages/ecosystem/fireux-fireux/src/runtime/project/'
const strip = (text, dev = true) =>
  stripTypeScriptTypes(
    text
      .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
      .replace(/^export /gm, '')
      .replaceAll('import.meta.dev', String(dev))
  )
const vueScript = (path) =>
  source(path).split('<script setup lang="ts">')[1].split('</script>')[0]
function load(text, dependencies, returned, dev = true) {
  return compileFunction(
    `${strip(text, dev)}\nreturn ${returned}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const intent = (
  action = 'none',
  target = '',
  message = 'Ready for review.'
) => ({ action, target, message })
const body = () => ({
  capability: 'landing',
  prompt: 'Open Create Project',
  context: {
    intro: {
      purpose: 'Projects',
      private: 'omit',
      allowance: {
        description: 'Free allowance is configured.',
        secret: 'omit',
      },
    },
    collection: {
      records: [
        { id: 'p1', name: 'First', private: 'omit' },
        { id: 'p2', name: 'Second' },
      ],
    },
    selected: { id: 'p1' },
    derived: { status: 'ready', canCreate: true, canPrepareApp: true },
  },
})
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function client(
  fetcher = async () => intent('create'),
  perform = () => true,
  token = async () => 'test-token'
) {
  const state = ref({
    ...body().context,
    derived: { landingState: 'ready', canCreate: true },
  })
  const currentUser = ref({ uid: 'u1', isAnonymous: false, getIdToken: token })
  const calls = [],
    performed = []
  const props = reactive({
    canPrepareApp: true,
    performAction: async (value) => {
      performed.push(value)
      return perform(value)
    },
  })
  let unmount
  const view = load(
    vueScript(core + 'components/Workspace/Home/AI.vue'),
    {
      computed,
      ref,
      watch,
      onBeforeUnmount: (callback) => {
        unmount = callback
      },
      useWorkspacePageState: () => ({ state }),
      useAuth: () => ({ currentUser }),
      defineProps: () => props,
      $fetch: async (...args) => {
        calls.push(args)
        return fetcher(...args)
      },
      setTimeout,
      clearTimeout,
    },
    '({ ask, prompt, message, error, submitting })'
  )
  view.prompt.value = 'Open Create Project'
  return {
    ...view,
    state,
    currentUser,
    props,
    calls,
    performed,
    unmount: () => unmount(),
  }
}
const tick = () => new Promise((resolve) => setImmediate(resolve))
test('client uses optional auth and opens the reviewed form, without duplicate requests', async () => {
  const response = deferred()
  const h = client(() => response.promise)
  const first = h.ask()
  await tick()
  await h.ask()
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0][0], '/api/workspace/project/intent')
  assert.equal(h.calls[0][1].retry, 0)
  assert.equal(h.calls[0][1].headers.authorization, 'Bearer test-token')
  assert.equal(h.calls[0][1].body.capability, 'landing')
  response.resolve(intent('create'))
  await first
  assert.equal(h.performed.length, 1)
  assert.match(h.message.value, /review.*confirming/)
  assert.equal(h.submitting.value, false)
  const guest = client(async () => intent())
  guest.currentUser.value = {
    uid: 'guest',
    isAnonymous: true,
    getIdToken: () => {
      throw Error('must not fetch guest token')
    },
  }
  await guest.ask()
  assert.deepEqual(guest.calls[0][1].headers, {})
})
test('selection or account changes, including ABA changes, discard in-flight actions', async () => {
  for (const change of [
    (h) => {
      h.state.value.selected.id = 'p2'
    },
    (h) => {
      h.currentUser.value = null
    },
    (h) => {
      h.state.value.selected.id = 'p2'
      h.state.value.selected.id = 'p1'
    },
    (h) => {
      h.props.canPrepareApp = false
    },
  ]) {
    const response = deferred()
    const h = client(() => response.promise)
    const pending = h.ask()
    await tick()
    change(h)
    response.resolve(intent('create'))
    await pending
    assert.equal(h.performed.length, 0)
    assert.match(h.message.value, /changed.*Ask again/)
  }
  const token = deferred()
  const h = client(undefined, undefined, () => token.promise)
  const pending = h.ask()
  h.currentUser.value = null
  token.resolve('late-token')
  await pending
  assert.equal(h.calls.length, 0)
})
test('failures allow explicit retry with the same prompt; denial and unmount do not apply actions', async () => {
  let attempts = 0
  const h = client(async () => {
    if (++attempts === 1) throw Error('private provider details')
    return intent('create')
  })
  await h.ask()
  assert.match(h.error.value, /Try again/)
  assert.doesNotMatch(h.error.value, /private/)
  assert.equal(h.submitting.value, false)
  assert.equal(h.prompt.value, 'Open Create Project')
  await h.ask()
  assert.equal(attempts, 2)
  assert.equal(h.error.value, '')
  assert.equal(h.performed.length, 1)
  const denied = client(undefined, () => false)
  await denied.ask()
  assert.match(denied.message.value, /no longer available/)
  const response = deferred()
  const gone = client(() => response.promise)
  const pending = gone.ask()
  await tick()
  gone.unmount()
  response.resolve(intent('create'))
  await pending
  assert.equal(gone.performed.length, 0)
})
test('Project performer rechecks creation permission and exact collection membership', () => {
  const create = ref(true),
    records = ref([{ id: 'p1' }]),
    status = ref('ready'),
    selected = []
  const view = load(
    vueScript(core + 'components/Workspace/Index.vue'),
    {
      computed,
      ref,
      watchEffect: () => {},
      defineProps: () => ({}),
      defineExpose: () => {},
      useWorkspaceCreation: () => ({ canCreate: create }),
      useProjectWorkspaceIndex: () => ({
        collection: records,
        access: { ids: ref(['p1']), outcome: ref('ready') },
        outcome: ref('ready'),
        selectedId: ref('p1'),
        select: (id) => selected.push(id),
      }),
      useProjectIdentity: () => ({}),
      useWorkspacePageState: () => ({}),
      useAppSession: () => ({
        pending: ref(false),
        error: ref(null),
        appUser: ref({ subscription: 'free' }),
      }),
      workspaceLandingState: () => status.value,
      useFireUXConfig: () => ({}),
    },
    '({ performAction, createOpen })'
  )
  assert.equal(view.performAction(intent('create')), true)
  assert.equal(view.createOpen.value, true)
  create.value = false
  view.createOpen.value = false
  assert.equal(view.performAction(intent('create')), false)
  assert.equal(view.createOpen.value, false)
  assert.equal(view.performAction(intent('read', 'other')), false)
  assert.equal(view.performAction(intent('read', 'p1')), true)
  assert.deepEqual(selected, ['p1'])
  records.value = []
  assert.equal(view.performAction(intent('read', 'p1')), false)
  status.value = 'error'
  create.value = true
  assert.equal(view.performAction(intent('create')), false)
  assert.equal(view.performAction(intent('open', 'app-setup')), false)
})
test('FireUX page opens Project Apps only with current selected Project access', async () => {
  const state = ref({
      derived: { landingState: 'ready', canUpdate: true },
      selected: { id: 'p1' },
    }),
    routes = []
  const page = load(
    vueScript('projects/fireux/fireux-app/app/pages/index.vue'),
    {
      computed,
      ref,
      useProjectAppContext: () => ({}),
      useWorkspacePageState: () => ({ state }),
      definePageMeta: () => {},
      useAppLandingSeo: () => {},
      appMeta: { seoHome: {} },
      navigateTo: async (route) => {
        routes.push(route)
      },
    },
    '({ performLandingAction })'
  )
  assert.equal(
    await page.performLandingAction(intent('open', 'app-setup')),
    true
  )
  assert.deepEqual(routes, ['/workspace/project/apps'])
  assert.equal(
    await page.performLandingAction(intent('open', '/untrusted')),
    false
  )
  state.value.derived.canUpdate = false
  assert.equal(
    await page.performLandingAction(intent('open', 'app-setup')),
    false
  )
  assert.equal(routes.length, 1)
})
