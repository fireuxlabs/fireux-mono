import { useDashboardProfiles } from '../runtime/composables/navigation/useDashboardProfiles.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { compile, computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

const source = readFileSync(
  new URL(
    '../runtime/composables/navigation/useDashboardNav.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const load = compileFunction(
  `${stripTypeScriptTypes(source)};return useDashboardNav`,
  [
    'computed',
    'useMounted',
    'useNav',
    'useUserSession',
    'useDeveloperAccess',
    'useWorkspaceEntryCta',
    'useDashboardProfiles',
  ]
)

test('profile navigation stays reactive and prefers one canonical entry per profile without session readers', () => {
  const items = ref([
    {
      group: 'profiles',
      profileId: 'cook',
      label: 'Cook',
      to: '/cook',
      order: 1,
    },
    {
      group: 'profiles',
      profileId: 'cook',
      label: 'Cook profile',
      to: '/cook/profile',
      order: 5,
    },
    {
      group: 'profiles',
      profileId: 'host',
      label: 'Host',
      to: '/host/profile',
      order: 2,
    },
    {
      group: 'other',
      profileId: 'ignored',
      label: 'Other',
      to: '/other',
      order: 0,
    },
  ])
  const profiles = useDashboardProfiles(items)
  assert.deepEqual(
    profiles.availableProfileEntries.value.map((item) => item.to),
    ['/host/profile', '/cook/profile']
  )
  items.value = []
  assert.deepEqual(profiles.availableProfileEntries.value, [])
})

test('cached permissions do not change the pre-hydration Dashboard tree; mounted navigation follows current authority', () => {
  const mounted = ref(false),
    admin = ref(true),
    developer = ref(true),
    workspace = ref(true)
  const nav = load(
    computed,
    () => mounted,
    () => ({ desktop: ref([]) }),
    () => ({ isAdmin: admin }),
    () => ({ isDeveloper: developer }),
    () => ({ hasWorkspaceEntry: workspace }),
    useDashboardProfiles
  )()
  const home = { key: 'dashboard-home' },
    privateItems = [
      { roles: ['admin'] },
      { roles: ['developer'] },
      { key: 'dashboard-workspace' },
    ]
  assert.equal(nav.baseNavFilter(home), true)
  assert.deepEqual(privateItems.map(nav.baseNavFilter), [false, false, false])
  mounted.value = true
  assert.deepEqual(privateItems.map(nav.baseNavFilter), [true, true, true])
  admin.value = false
  developer.value = false
  workspace.value = false
  assert.deepEqual(privateItems.map(nav.baseNavFilter), [false, false, false])
})

test('Profile button follows User identity and keeps an accessible collapsed link', async () => {
  const text = readFileSync(
    new URL(
      '../runtime/components/layouts/dashboard/ProfileButton.vue',
      import.meta.url
    ),
    'utf8'
  )
  const script = text
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const user = ref(null)
  const uid = ref('person')
  const isSignedIn = ref(false)
  let readTarget
  const state = compileFunction(
    stripTypeScriptTypes(script) + '; return { label }',
    ['computed', 'defineProps', 'useAuthPhase', 'useUserRead']
  )(
    computed,
    () => ({}),
    () => ({ uid, isSignedIn }),
    (target) => {
      readTarget = target
      return { user: computed(() => (target.value ? user.value : undefined)) }
    }
  )
  const collapsed = ref(false)
  const component = defineComponent({
    setup: () => ({ ...state, collapsed }),
    render: compile(
      text.slice(text.indexOf('<template>') + 10, text.indexOf('</template>'))
    ),
  })
  const app = createSSRApp(component)
  app.component(
    'UButton',
    defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        return () =>
          h(
            'a',
            { href: attrs.to, 'aria-label': attrs['aria-label'] },
            attrs.label
          )
      },
    })
  )
  assert.match(await renderToString(app), /aria-label="Your profile"/)
  assert.equal(readTarget.value, '')
  user.value = { display_name: 'Daniel' }
  assert.match(await renderToString(app), /aria-label="Your profile"/)
  isSignedIn.value = true
  assert.equal(readTarget.value, 'person')
  assert.match(await renderToString(app), />Daniel<\/a>/)
  collapsed.value = true
  const compact = await renderToString(app)
  assert.match(compact, /href="\/dashboard\/user-profile"/)
  assert.match(compact, /aria-label="Daniel"/)
  assert.doesNotMatch(compact, />Daniel<\/a>/)
})

test('member and admin Workspace navigation follows configured availability, not admin access', async () => {
  const text = readFileSync(
    new URL('../runtime/pages/dashboard/workspace.vue', import.meta.url),
    'utf8'
  )
  const script = text
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  for (const isAdmin of [false, true]) {
    for (const available of [false, true]) {
      let meta
      const destinations = []
      const run = compileFunction(
        'return async () => {' + stripTypeScriptTypes(script) + '}',
        ['definePageMeta', 'useWorkspaceEntryCta', 'navigateTo']
      )(
        (value) => {
          meta = value
        },
        () => ({
          hasWorkspaceEntry: ref(available),
          openWorkspace: async () => destinations.push('/workspace/project'),
          workspaceRootPath: '/home',
        }),
        async (path) => destinations.push(path)
      )
      await run()
      assert.equal(meta.requiresAuth, true)
      assert.equal(meta.roles, undefined)
      assert.deepEqual(destinations, [
        available ? '/workspace/project' : '/home',
      ])
      const nav = load(
        computed,
        () => ref(true),
        () => ({ desktop: ref([]) }),
        () => ({ isAdmin: ref(isAdmin) }),
        () => ({ isDeveloper: ref(false) }),
        () => ({ hasWorkspaceEntry: ref(available) }),
        useDashboardProfiles
      )()
      assert.equal(
        nav.baseNavFilter({ ...meta.nav, roles: meta.roles }),
        available
      )
      assert.equal(
        nav.baseNavFilter({ key: 'dashboard-admin', roles: ['admin'] }),
        isAdmin
      )
    }
  }
})
