import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { compile, computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

const root = new URL('../runtime/user/components/', import.meta.url)
function source(file) {
  return readFileSync(new URL(file, root), 'utf8')
}
function load(file, names, dependencies) {
  const script = source(file)
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  return compileFunction(
    stripTypeScriptTypes(script) + '; return ' + names,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
async function render(file, state, slot) {
  const text = source(file)
  const component = defineComponent({
    setup: () => state,
    render: compile(
      text.slice(
        text.indexOf('<template>') + 10,
        text.lastIndexOf('</template>')
      )
    ),
  })
  const app = createSSRApp({
    render: () => h(component, {}, slot ? { default: () => h('p', slot) } : {}),
  })
  app.component(
    'UPageCard',
    defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => h('section', [attrs.title, slots.default?.()])
      },
    })
  )
  app.component(
    'UButton',
    defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        return () => h('a', { href: attrs.to }, attrs.label)
      },
    })
  )
  app.component(
    'FireState',
    defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        return () => h('p', `${attrs.outcome}: ${attrs.entity}`)
      },
    })
  )
  app.component(
    'UserEditCore',
    defineComponent({ setup: () => () => h('p', 'Public profile editor') })
  )
  return renderToString(app)
}

test('Profile owns only the public User read and keeps its recovery destination', async () => {
  const uid = ref('person')
  const user = ref({ id: 'person', handle: 'person' })
  const outcome = ref('ready'),
    error = ref(null)
  const forbidden = () =>
    assert.fail('Profile acquired private account or membership state')
  const state = load(
    'Edit/Profile.vue',
    '{user,outcome,error,publicPath,isPending,reload}',
    {
      computed,
      useAuth: () => ({ uid }),
      useUserRead: (target) => {
        assert.equal(target, uid)
        return { user, outcome, error }
      },
      useUserView: () => ({
        profile: (value) => (value ? { to: '/users/' + value.handle } : null),
      }),
      useUserAccount: forbidden,
      useUserSession: forbidden,
      useAppUserRead: forbidden,
    }
  )
  const ready = await render('Edit/Profile.vue', state)
  assert.match(ready, /Public profile editor/)
  assert.match(ready, /href="\/users\/person"/)
  assert.doesNotMatch(ready, /Terms|Email|Your plan|Membership/)
  user.value = null
  outcome.value = 'empty'
  const empty = await render('Edit/Profile.vue', state)
  assert.match(empty, /\/users\/create\?redirect=%2Fdashboard%2Fuser-profile/)
  assert.doesNotMatch(empty, /Public profile editor/)
  outcome.value = 'error'
  assert.match(await render('Edit/Profile.vue', state), /error: your profile/)
})

test('private account details and context stay behind the account read outcome', async () => {
  const outcome = ref('pending')
  const account = ref(null)
  let reads = 0
  const state = load(
    'Account/Details.vue',
    '{account,outcome,acceptedAt,reload}',
    {
      computed,
      useUserAccount: () => {
        reads++
        return { account, outcome }
      },
      formatFirestoreTimestamp: (value) => (value ? 'Accepted date' : ''),
    }
  )
  for (const phase of ['pending', 'error', 'empty']) {
    outcome.value = phase
    const html = await render('Account/Details.vue', state, 'Private context')
    assert.doesNotMatch(html, /Private context/)
    if (phase === 'empty')
      assert.match(html, /\/users\/create\?redirect=%2Fdashboard%2Fsettings/)
  }
  account.value = {
    email: 'person@example.test',
    terms: { version: 'current', accepted_at: { seconds: 1 } },
  }
  outcome.value = 'ready'
  const html = await render('Account/Details.vue', state, 'Private context')
  assert.match(html, /person@example.test/)
  assert.match(html, /Accepted date/)
  assert.match(html, /Private context/)
  assert.equal(reads, 1)
})

test('session actions need no account read and sign out stays single-flight', async () => {
  const calls = []
  let finish
  const state = load(
    'Account/Session.vue',
    '{currentUser,hasAuthState,isAuthenticated,mounted,busy,signOut}',
    {
      ref,
      useMounted: () => ref(false),
      useAuth: () => ({
        currentUser: ref({ email: 'person@example.test' }),
        hasAuthState: ref(true),
        isAuthenticated: ref(true),
        signOutUser: (path) => {
          calls.push(path)
          return new Promise((resolve) => {
            finish = resolve
          })
        },
      }),
      useUserAccount: () =>
        assert.fail('A private-account failure must not block sign-out'),
    }
  )
  const initial = await render('Account/Session.vue', state)
  assert.match(initial, /pending: your session/)
  assert.doesNotMatch(initial, /Sign out|person@example.test/)
  state.mounted.value = true
  assert.match(await render('Account/Session.vue', state), /Sign out/)
  const pending = state.signOut()
  await state.signOut()
  assert.deepEqual(calls, ['/'])
  assert.equal(state.busy.value, true)
  finish()
  await pending
  assert.equal(state.busy.value, false)
  state.isAuthenticated.value = false
  assert.match(
    await render('Account/Session.vue', state),
    /\/auth\?redirect=%2Fdashboard%2Fsettings/
  )
})
