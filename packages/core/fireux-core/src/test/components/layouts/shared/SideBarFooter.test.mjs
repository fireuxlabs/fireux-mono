import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref } from 'vue'

test('footer uses the settled User reader and keeps only account actions', async () => {
  const source = readFileSync(
    new URL(
      '../../../../runtime/components/layouts/shared/SideBarFooter.vue',
      import.meta.url
    ),
    'utf8'
  )
  const script = source
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const signedIn = ref(true),
    uid = ref('person'),
    user = ref({ display_name: 'Person' }),
    outcome = ref('ready')
  const calls = []
  let mount
  const deps = {
    computed,
    ref,
    onMounted: (fn) => {
      mount = fn
    },
    defineProps: () => ({}),
    withDefaults: () => ({ collapsed: false, showHome: true }),
    useFireUXConfig: () => ({ appName: 'Example', homePath: '/home' }),
    useAuth: () => ({
      currentUser: ref({ displayName: 'Provider', isAnonymous: false }),
      signOutUser: async (to) => calls.push(to),
    }),
    useRoute: () => ({ fullPath: '/dashboard/settings?tab=account' }),
    useAuthPhase: () => ({
      uid,
      isSignedIn: signedIn,
      isGuest: computed(() => !signedIn.value),
    }),
    useUserRead: (target) => {
      assert.equal(target.value, 'person')
      return { user, outcome }
    },
    useUserView: () => ({ toView: () => ({ avatarUrl: '/avatar.png' }) }),
    useUserSession: () => assert.fail('Footer must not acquire membership'),
  }
  const state = compileFunction(
    stripTypeScriptTypes(script) +
      '; return {profileUser,userMenuItems,actionItems,target,signInTo}',
    Object.keys(deps)
  )(...Object.values(deps))
  assert.equal(state.profileUser.value, undefined)
  mount()
  assert.equal(state.profileUser.value.displayName, 'Person')
  const actions = state.userMenuItems.value
    .flat()
    .filter((item) => item.to || item.onSelect)
  assert.deepEqual(
    actions.map((item) => item.label),
    ['Profile', 'Settings', 'Sign out']
  )
  assert.deepEqual(
    actions.slice(0, 2).map((item) => item.to),
    ['/dashboard/user-profile', '/dashboard/settings']
  )
  await actions[2].onSelect()
  assert.deepEqual(calls, ['/'])
  assert.equal(state.actionItems.value[0].to, '/home')
  outcome.value = 'error'
  user.value = null
  assert.equal(state.profileUser.value.displayName, 'Provider')
  signedIn.value = false
  assert.equal(state.target.value, '')
  assert.equal(
    state.signInTo.value.query.redirect,
    '/dashboard/settings?tab=account'
  )
})
