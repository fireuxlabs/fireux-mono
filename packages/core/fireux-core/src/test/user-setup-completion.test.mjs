import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  onScopeDispose,
  reactive,
  ref,
  watch,
} from 'vue'
import { resolveUserOnboardingDestination } from '../runtime/utils/onboarding-route.ts'
function load(path, result, deps) {
  let source = readFileSync(
    new URL('../runtime/' + path, import.meta.url),
    'utf8'
  )
  if (path.endsWith('.vue'))
    source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  'composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function setupHarness(kind = 'user') {
  const owner = effectScope(),
    gate = deferred(),
    calls = [],
    navigations = []
  const authUser = ref({ uid: 'actor', email: 'actor@example.test' }),
    config = reactive({ appId: 'app', appName: 'Example' })
  const route = reactive({
    fullPath: '/users/create?redirect=%2Fworkspace%3Fmenu%3DA%23details',
    query: { redirect: '/workspace?menu=A#details' },
  })
  const control = owner.run(() =>
    load(
      'user/components/Create/System.vue',
      '{handleEnsure,error,isEnsuring,onboardingConsentAcknowledged,signInTarget,returnTarget}',
      {
        computed,
        ref,
        watch,
        useCommandScope,
        useRoute: () => route,
        useRouter: () => ({ replace: async (to) => navigations.push(to) }),
        useFireUXConfig: () => config,
        resolveUserAvatarSource: (x) => x,
        resolveUserOnboardingDestination,
        FIREUX_ACCOUNT_TERMS_VERSION: 'current',
        useUserSession: () => ({
          canSelfJoin: ref(true),
          appPolicyPending: ref(false),
          appPolicyError: ref(null),
          appError: ref(null),
          appOutcome: ref('missing'),
          appUser: ref(null),
          coreError: ref(null),
          coreOutcome: ref(kind === 'user' ? 'missing' : 'ready'),
          coreUser: ref(kind === 'user' ? null : { id: 'actor' }),
        }),
        useUserAccount: () => ({
          account: ref(
            kind === 'user'
              ? null
              : { terms: { version: 'current', accepted_at: 1 } }
          ),
          error: ref(null),
          outcome: ref(kind === 'user' ? 'missing' : 'ready'),
        }),
        useUserBootstrap: () => ({
          bootstrapUser: () => {
            calls.push('join')
            return gate.promise
          },
        }),
        useAuth: () => ({
          currentUser: authUser,
          hasAuthState: ref(true),
          isAuthenticated: ref(true),
          retryAccountProvisioning: () => {
            calls.push('user')
            return gate.promise
          },
        }),
      }
    )
  )
  control.onboardingConsentAcknowledged.value = true
  return { owner, gate, calls, navigations, authUser, config, route, control }
}
for (const kind of ['user', 'app'])
  for (const change of ['stable', 'account', 'app', 'route', 'disposal'])
    for (const failure of [false, true])
      test(`${kind} setup ${failure ? 'failure' : 'success'} completion respects ${change} context`, async () => {
        const h = setupHarness(kind),
          pending = h.control.handleEnsure()
        assert.equal(h.calls.length, 1)
        if (change === 'account') {
          h.authUser.value = { uid: 'other' }
          h.authUser.value = { uid: 'actor' }
        }
        if (change === 'app') {
          h.config.appId = 'other'
          h.config.appId = 'app'
        }
        if (change === 'route') {
          h.route.fullPath = '/other'
          h.route.fullPath =
            '/users/create?redirect=%2Fworkspace%3Fmenu%3DA%23details'
        }
        if (change === 'disposal') h.owner.stop()
        if (failure) h.gate.reject(new Error('Controlled failure'))
        else h.gate.resolve(true)
        await pending
        assert.deepEqual(
          h.navigations,
          change === 'stable' && !failure ? ['/workspace?menu=A#details'] : []
        )
        assert.equal(
          h.control.error.value,
          change === 'stable' && failure ? 'Controlled failure' : null
        )
        if (change !== 'stable' && change !== 'disposal')
          assert.equal(h.control.onboardingConsentAcknowledged.value, false)
        h.owner.stop()
      })
test('Setup cannot start without explicit terms consent', async () => {
  const h = setupHarness()
  h.control.onboardingConsentAcknowledged.value = false
  await h.control.handleEnsure()
  assert.equal(h.calls.length, 0)
  assert.equal(h.navigations.length, 0)
  assert.match(h.control.error.value, /Terms/)
  h.owner.stop()
})
test('Sign-in fallback keeps the internal destination and rejects another origin', () => {
  const h = setupHarness()
  assert.equal(
    new URL(
      h.control.signInTarget.value,
      'https://example.test'
    ).searchParams.get('redirect'),
    '/workspace?menu=A#details'
  )
  h.route.query.redirect = 'https://attacker.example'
  assert.equal(h.control.returnTarget.value, '/dashboard')
  h.owner.stop()
})
function avatarHarness() {
  const owner = effectScope(),
    gate = deferred(),
    notifications = []
  const props = reactive({
      user: { id: 'actor', avatar: '', display_name: 'Actor' },
    }),
    currentUser = ref({ uid: 'actor' }),
    config = reactive({ appId: 'app' })
  const control = owner.run(() =>
    load(
      'user/components/Edit/Avatar.vue',
      '{handleAvatarUpload,avatarUploading}',
      {
        computed,
        ref,
        watch,
        useCommandScope,
        defineProps: () => props,
        useAuth: () => ({ currentUser }),
        useFireUXConfig: () => config,
        useToastify: () => ({
          success: (x) => notifications.push(x),
          error: (x) => notifications.push(x),
        }),
        useAvatarProxy: () => ({
          useProxiedAvatar: (source) => computed(source),
        }),
        useUserProfileUpdate: () => ({ avatar: () => gate.promise }),
      }
    )
  )
  return { owner, gate, notifications, props, currentUser, config, control }
}
for (const change of ['stable', 'account', 'app', 'user', 'disposal'])
  for (const failure of [false, true])
    test(`Shared avatar ${failure ? 'failure' : 'success'} completion respects ${change} context`, async () => {
      const h = avatarHarness(),
        pending = h.control.handleAvatarUpload({})
      assert.equal(h.control.avatarUploading.value, true)
      if (change === 'account') {
        h.currentUser.value = { uid: 'other' }
        h.currentUser.value = { uid: 'actor' }
      }
      if (change === 'app') {
        h.config.appId = 'other'
        h.config.appId = 'app'
      }
      if (change === 'user') {
        h.props.user.id = 'other'
        h.props.user.id = 'actor'
      }
      if (change === 'disposal') h.owner.stop()
      if (failure) h.gate.reject(new Error('Controlled failure'))
      else h.gate.resolve(true)
      await pending
      assert.equal(h.notifications.length, change === 'stable' ? 1 : 0)
      if (change !== 'disposal')
        assert.equal(h.control.avatarUploading.value, false)
      h.owner.stop()
    })
