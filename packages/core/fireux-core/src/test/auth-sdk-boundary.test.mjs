import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import {
  computed,
  effectScope,
  isProxy,
  markRaw,
  ref,
  watch,
  nextTick,
} from 'vue'

test('auth binding keeps the Firebase service opaque to deep state watchers', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/composables/fireux/firebase/useAuth.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
    .replaceAll('import.meta.server', 'false')
  const states = new Map()
  const sdk = {
    popup: new Proxy(
      {},
      {
        get() {
          throw new Error('Cross-origin popup must not be traversed')
        },
      }
    ),
  }
  const appScope = effectScope(true)
  const dependencies = {
    useNuxtApp: () => ({ _scope: appScope }),
    computed,
    markRaw,
    watch,
    useRouter: () => null,
    useState: (key, initial) => {
      if (!states.has(key)) states.set(key, ref(initial()))
      return states.get(key)
    },
    useFirebaseAuth: () => sdk,
    useCurrentUser: () => ref(null),
    onAuthStateChanged: () => () => {},
  }
  const useAuth = compileFunction(
    `${stripTypeScriptTypes(source)}; return useAuth`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const scope = effectScope()
  try {
    const auth = scope.run(() => useAuth())
    assert.equal(auth.isReady.value, true)
    assert.equal(isProxy(auth.auth.value), false)
    assert.equal(auth.auth.value, sdk)
    assert.doesNotThrow(() =>
      scope.run(() => {
        watch(auth.auth, () => {}, { deep: true, immediate: true })
      })
    )
    await Promise.resolve()
  } finally {
    scope.stop()
    appScope.stop()
  }
})

test('resolved auth is app-owned and survives consumer disposal and later binding contexts', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/composables/fireux/firebase/useAuth.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
    .replaceAll('import.meta.server', 'false')
  const states = new Map()
  const appScope = effectScope(true)
  const consumer = effectScope()
  const user = ref({ uid: 'restored-user', isAnonymous: false })
  let binds = 0
  let failBinding = false
  let authCallback
  const sdk = { currentUser: user.value }
  const dependencies = {
    computed,
    markRaw,
    watch,
    useRouter: () => null,
    useNuxtApp: () => ({ _scope: appScope }),
    useState: (key, initial) => {
      if (!states.has(key)) states.set(key, ref(initial()))
      return states.get(key)
    },
    useFirebaseAuth: () => {
      binds++
      if (failBinding) throw new Error('No injection context')
      return null
    },
    getApps: () => [{}],
    getAuth: () => sdk,
    useCurrentUser: () => user,
    onAuthStateChanged: (_auth, callback) => {
      authCallback = callback
      return () => {}
    },
  }
  const useAuth = compileFunction(
    `${stripTypeScriptTypes(source)}; return useAuth`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  try {
    const auth = consumer.run(useAuth)
    await authCallback(user.value)
    assert.equal(auth.isAuthenticated.value, true)
    consumer.stop()
    user.value = { uid: 'other-user', isAnonymous: false }
    await nextTick()
    assert.equal(
      auth.uid.value,
      'other-user',
      'app session must follow VueFire after its first consumer unmounts'
    )
    failBinding = true
    const later = useAuth()
    assert.equal(later.uid.value, 'other-user')
    assert.equal(later.hasAuthState.value, true)
    assert.equal(later.lastBindError.value, null)
    assert.equal(binds, 1, 'reading an established session must not bind again')
    user.value = null
    await nextTick()
    assert.equal(
      auth.isAuthenticated.value,
      false,
      'real SDK sign-out still propagates'
    )
  } finally {
    consumer.stop()
    appScope.stop()
  }
})
