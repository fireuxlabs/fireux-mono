import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, reactive } from 'vue'
import {
  resolveInternalRedirect,
  resolvePostAuthDestination,
} from '../../../../packages/core/fireux-core/src/runtime/utils/onboarding-route.ts'
function page(path, result, route, preview = null) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const deps = {
    computed,
    ref,
    useRoute: () => route,
    definePageMeta: () => {},
    useHead: () => {},
    onMounted: () => {},
    resolveInternalRedirect,
    resolvePostAuthDestination,
    useFireuxSignIn: () => ({
      start: () => {},
      busy: ref(false),
      error: ref(''),
    }),
    useAsyncData: () => ({
      data: ref(preview),
      pending: ref(false),
      error: ref(null),
    }),
    useAuth: () => ({
      currentUser: ref(null),
      hasAuthState: ref(true),
      signOutUser: () => {},
    }),
    useCommandScope: () => () => true,
    useAccountConnectionAction: () => ({
      run: () => {},
      busy: ref(false),
      error: ref(''),
    }),
  }
  return compileFunction(
    stripTypeScriptTypes(source, { mode: 'transform' }) + ';return ' + result,
    Object.keys(deps)
  )(...Object.values(deps))
}
test('ordinary fallback and restart keep the exact destination and reject external targets', () => {
  for (const target of [
    '/workspace/kitchen?menu=A#details',
    '/invite/abc?source=mail',
    'https://attacker.example',
  ]) {
    const route = reactive({
      query: { redirect: target },
      fullPath: '/account/fireux/start',
    })
    const expected = resolvePostAuthDestination(target)
    const start = page(
      '../app/pages/account/fireux/start.vue',
      '{authPath}',
      route
    )
    assert.equal(
      new URL(start.authPath.value, 'http://localhost').searchParams.get(
        'redirect'
      ),
      expected
    )
    const callback = page(
      '../app/pages/account/fireux/callback.vue',
      '{authPath,startPath}',
      route
    )
    for (const path of [callback.authPath.value, callback.startPath.value])
      assert.equal(
        new URL(path, 'http://localhost').searchParams.get('redirect'),
        expected
      )
  }
})
test('callback fallback prefers browser-bound preview over supplied query context', () => {
  const route = reactive({
    query: { redirect: '/wrong-destination' },
    fullPath: '/account/fireux/callback',
  })
  const callback = page(
    '../app/pages/account/fireux/callback.vue',
    '{authPath,startPath}',
    route,
    { returnTo: '/menus/A#order' }
  )
  assert.equal(
    new URL(callback.authPath.value, 'http://localhost').searchParams.get(
      'redirect'
    ),
    '/menus/A#order'
  )
  assert.equal(
    new URL(callback.startPath.value, 'http://localhost').searchParams.get(
      'redirect'
    ),
    '/menus/A#order'
  )
})
test('canceling optional connection restores the original destination without accepting another origin', () => {
  const route = reactive({
    query: {
      resume: '/account/continue?state=opaque&redirect=%2Fmenus%2FA%23order',
    },
    fullPath: '/account/connect',
  })
  const connect = page(
    '../app/pages/account/connect.vue',
    '{cancelPath}',
    route
  )
  assert.equal(connect.cancelPath.value, '/menus/A#order')
  for (const resume of [
    'https://attacker.example/account/continue?redirect=/menus/A',
    '//attacker.example',
    '/dashboard?redirect=/menus/A',
    null,
  ]) {
    route.query.resume = resume
    assert.equal(connect.cancelPath.value, '/dashboard')
  }
})
