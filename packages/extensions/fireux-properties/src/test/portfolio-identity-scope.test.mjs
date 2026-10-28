import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch, onScopeDispose, effectScope } from 'vue'
function load(file, deps, name, vue = false) {
  let source = readFileSync(new URL(file, import.meta.url), 'utf8')
  if (vue)
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
const useCommandScope = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  { watch, onScopeDispose },
  'useCommandScope'
)
function setup() {
  const currentUser = ref({ uid: 'u' }),
    selectedId = ref('p'),
    appId = ref('app'),
    routePath = ref('/identity'),
    disposed = []
  return { currentUser, selectedId, appId, routePath, disposed }
}
test('Portfolio update captures fields and rejects credential/response account/App/selection/route roundtrips', async () => {
  for (const stage of ['auth', 'token', 'response'])
    for (const change of [
      'stable',
      'account',
      'app',
      'selection',
      'route',
      'logout',
      'dispose',
    ]) {
      const h = setup(),
        auth = deferred(),
        token = deferred(),
        response = deferred(),
        calls = [],
        user = { uid: 'u', getIdToken: () => token.promise }
      h.currentUser.value = user
      const owner = effectScope()
      h.disposed.push(() => owner.stop())
      const api = owner.run(() =>
        load(
          '../runtime/portfolio/composables/firestore/mutations/usePortfolioUpdate.ts',
          {
            useCommandScope,
            useAppSession: () => ({ appUser: ref({ id: 'u' }) }),
            useAuth: () => ({ currentUser: h.currentUser }),
            useWorkspace: () => ({ selectedId: h.selectedId }),
            useFireUXConfig: () => ({
              get appId() {
                return h.appId.value
              },
            }),
            useRoute: () => ({
              get fullPath() {
                return h.routePath.value
              },
            }),
            useRequireUser: () => auth.promise,
            $fetch: (...args) => {
              calls.push(args)
              return response.promise
            },
          },
          'usePortfolioUpdate'
        )()
      )
      const input = { portfolioId: 'p', changes: { identity: { name: 'Original' } } },
        pending = api.updatePortfolio(
          input,
          owner.run(() => useCommandScope([h.selectedId, h.routePath]))()
        ),
        done =
          change === 'stable' || stage === 'response'
            ? pending
            : assert.rejects(pending, /changed/)
      if (stage !== 'auth') {
        auth.resolve(user)
        await Promise.resolve()
      }
      if (stage === 'response') {
        token.resolve('token')
        await Promise.resolve()
      }
      input.changes.identity.name = 'Changed'
      if (change === 'account' || change === 'logout') {
        h.currentUser.value = change === 'logout' ? null : { uid: 'b' }
        h.currentUser.value = user
      } else if (change === 'app') {
        h.appId.value = 'b'
        h.appId.value = 'app'
      } else if (change === 'selection') {
        h.selectedId.value = 'q'
        h.selectedId.value = 'p'
      } else if (change === 'route') {
        h.routePath.value = '/other'
        h.routePath.value = '/identity'
      } else if (change === 'dispose') h.disposed.forEach((fn) => fn())
      auth.resolve(user)
      token.resolve('token')
      response.resolve({ ok: true, portfolioId: 'p' })
      await done
      assert.equal(
        calls.length,
        change === 'stable' || stage === 'response' ? 1 : 0
      )
      if (calls.length)
        assert.deepEqual(calls[0][1].body, {
          portfolioId: 'p',
          changes: { identity: { name: 'Original' } },
        })
      owner.stop()
    }
})
test('Portfolio Identity suppresses obsolete field success and error toasts', async () => {
  for (const changed of [false, true])
    for (const failed of [false, true]) {
      let current = true
      const pending = deferred(),
        calls = []
      let submittedSurface
      const api = load(
        '../runtime/portfolio/components/Workspace/Identity/Edit/Index.vue',
        {
          defineProps: () => ({
            identity: { portfolioId: ref('p'), canWrite: ref(true) },
          }),
          usePortfolioUpdate: () => ({
            updatePortfolio: (_input, isCurrent) => {
              submittedSurface = isCurrent
              return pending.promise
            },
            captureIntent: () => () => current,
          }),
          useRoute: () => ({ fullPath: '/identity' }),
          useCommandScope: () => () => () => current,
          useToastify: () => ({ add: (x) => calls.push(x) }),
        },
        '({handleName})',
        true
      )
      const result = api.handleName('Name')
      const done =
        failed && !changed ? assert.rejects(result, /Failure/) : result
      assert.equal(submittedSurface(), true)
      current = !changed
      assert.equal(submittedSurface(), !changed)
      failed ? pending.reject(Error('Failure')) : pending.resolve()
      await done
      assert.equal(calls.length, changed ? 0 : 1)
    }
})
