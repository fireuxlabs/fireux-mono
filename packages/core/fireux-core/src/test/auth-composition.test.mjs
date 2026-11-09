import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, effectScope, nextTick, reactive, ref, watch } from 'vue'
import { googleSignInFeedback } from '../runtime/utils/auth/sign-in-feedback.ts'
import {
  resolvePostAuthDestination,
  userOnboardingPath,
} from '../runtime/user/utils/auth-redirect.ts'

function load(name, result, dependencies) {
  const source = readFileSync(
    new URL(`../runtime/components/Auth/${name}.vue`, import.meta.url),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + '; return ' + result,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

test('SignIn coordinates Google and email without overlapping provider requests', async () => {
  let calls = 0,
    finish
  const control = load(
    'SignIn',
    '{handleGoogle,handleEmailBusy,providerLoading,providerError}',
    {
      computed,
      ref,
      googleSignInFeedback,
      useRoute: () => ({ query: {} }),
      useAuth: () => ({
        lastBindError: ref(null),
        signInWithGoogle: () => {
          calls++
          return new Promise((resolve) => {
            finish = resolve
          })
        },
      }),
    }
  )
  control.handleEmailBusy(true)
  await control.handleGoogle()
  assert.equal(calls, 0)
  control.handleEmailBusy(false)
  const pending = control.handleGoogle()
  await control.handleGoogle()
  assert.equal(calls, 1)
  assert.equal(control.providerLoading.value, true)
  finish(null)
  await pending
  assert.equal(control.providerLoading.value, false)
  assert.deepEqual(control.providerError.value, googleSignInFeedback(null))
  control.handleEmailBusy(true)
  assert.equal(control.providerError.value, null)
})

test('SignIn reports authored provider feedback and configuration availability', async () => {
  const lastBindError = ref({ code: 'auth/configuration-not-found' })
  const control = load(
    'SignIn',
    '{handleGoogle,providerError,authUnavailableMessage,authMode}',
    {
      computed,
      ref,
      googleSignInFeedback,
      useRoute: () => ({ query: { mode: 'sign-up' } }),
      useAuth: () => ({
        lastBindError,
        signInWithGoogle: async () => {
          throw new Error('private-provider-detail')
        },
      }),
    }
  )
  assert.match(control.authUnavailableMessage.value, /hasn’t been set up/)
  assert.equal(control.authMode.value, 'sign-up')
  lastBindError.value = null
  assert.equal(control.authUnavailableMessage.value, '')
  await control.handleGoogle()
  assert.equal(
    JSON.stringify(control.providerError.value).includes(
      'private-provider-detail'
    ),
    false
  )
})

function continuation() {
  const owner = effectScope()
  const route = reactive({
    path: '/auth',
    fullPath: '/auth?redirect=%2Fworkspace%3Fview%3DA%23detail',
    query: { redirect: '/workspace?view=A#detail' },
  })
  const status = ref({ pending: true, failed: false, needsSetup: false })
  const error = ref(null)
  const moves = [],
    signOuts = []
  let failNavigation = false,
    reloads = 0,
    finishSignOut
  const control = owner.run(() =>
    load(
      'Continue',
      '{retry,changeAccount,navigationError,accountSwitchBusy}',
      {
        computed,
        ref,
        watch,
        resolvePostAuthDestination,
        userOnboardingPath,
        useRoute: () => route,
        useRouter: () => ({
          replace: async (path) => {
            moves.push(path)
            if (failNavigation) throw new Error('navigation failed')
          },
        }),
        useUserSetup: () => ({ status, error }),
        useAuth: () => ({
          isAuthenticated: ref(true),
          hasAuthState: ref(true),
          signOutUser: (path) => {
            signOuts.push(path)
            return new Promise((resolve) => {
              finishSignOut = resolve
            })
          },
        }),
        window: { location: { reload: () => reloads++ } },
      }
    )
  )
  return {
    owner,
    route,
    status,
    error,
    moves,
    signOuts,
    control,
    fail: () => {
      failNavigation = true
    },
    recover: () => {
      failNavigation = false
    },
    reloads: () => reloads,
    finishSignOut: () => finishSignOut(),
  }
}

test('Continue preserves setup and full return destinations and stops observing after disposal', async () => {
  const h = continuation()
  assert.deepEqual(h.moves, [])
  h.status.value = { pending: false, failed: false, needsSetup: true }
  await nextTick()
  assert.deepEqual(h.moves, [userOnboardingPath('/workspace?view=A#detail')])
  h.owner.stop()
  h.status.value = { pending: false, failed: false, needsSetup: false }
  await nextTick()
  assert.equal(h.moves.length, 1)
})

test('Continue retries navigation separately from failed account reads', async () => {
  const h = continuation()
  h.fail()
  h.status.value = { pending: false, failed: false, needsSetup: false }
  await nextTick()
  assert.match(h.control.navigationError.value, /Please try/)
  h.recover()
  await h.control.retry()
  assert.equal(h.control.navigationError.value, '')
  assert.deepEqual(h.moves, [
    '/workspace?view=A#detail',
    '/workspace?view=A#detail',
  ])
  h.status.value.failed = true
  h.error.value = new Error('read failed')
  await h.control.retry()
  assert.equal(h.reloads(), 1)
  h.owner.stop()
})

test('Continue keeps account switching single-flight and retains the auth return URL', async () => {
  const h = continuation()
  const pending = h.control.changeAccount()
  await h.control.changeAccount()
  assert.deepEqual(h.signOuts, [h.route.fullPath])
  assert.equal(h.control.accountSwitchBusy.value, true)
  h.finishSignOut()
  await pending
  assert.equal(h.control.accountSwitchBusy.value, false)
  h.route.path = '/home'
  h.status.value = { pending: false, failed: false, needsSetup: false }
  await nextTick()
  assert.deepEqual(h.moves, [])
  h.owner.stop()
})
