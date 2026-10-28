import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { computed, effectScope, isProxy, markRaw, ref, watch } from 'vue'

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
  const dependencies = {
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
    useUserBootstrap: () => null,
    createAuthAccountProvisioner: () => ({
      retry: () => {},
      reset: () => {},
      creating: ref(false),
    }),
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
  }
})
