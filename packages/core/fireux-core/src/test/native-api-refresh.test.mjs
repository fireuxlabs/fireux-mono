import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { effectScope, ref, watch } from 'vue'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.dev', 'false')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

test('direct Firestore commands refresh API data once after success and never after a failed write', async () => {
  for (const operation of ['create-auto', 'create-exact', 'update', 'delete'])
    for (const failed of [false, true]) {
      const events = []
      const write = async () => {
        events.push('write')
        if (failed) throw new Error('write failed')
        return { id: 'saved' }
      }
      const dependencies = {
        useFirestoreResolver: () => () => ({}),
        useRequireUser: async () => ({ uid: 'actor' }),
        useFireUXConfig: () => ({ appId: 'app' }),
        collection: () => ({}),
        doc: () => ({}),
        serverTimestamp: () => 'timestamp',
        addDoc: write,
        updateDoc: write,
        deleteDoc: write,
        runTransaction: async (_db, run) => {
          await run({
            get: async () => ({ exists: () => false }),
            set: () => {},
          })
          await write()
        },
        refreshNuxtData: async () => events.push('refresh'),
      }
      const name = operation.startsWith('create')
        ? 'Create'
        : operation === 'update'
          ? 'Update'
          : 'Delete'
      const factory = load(
        `../runtime/composables/fireux/firestore/operations/useFirestore${name}.ts`,
        `useFirestore${name}`,
        dependencies
      )
      const controller = factory()
      const command = () =>
        name === 'Create'
          ? controller.createDocument(
              'records',
              { name: 'Record' },
              {
                stamp: false,
                ...(operation === 'create-exact' ? { id: 'exact' } : {}),
              }
            )
          : name === 'Update'
            ? controller.updateDocument(
                'records',
                'id',
                { name: 'Changed' },
                { stamp: false }
              )
            : controller.deleteDocument('records', 'id')
      if (failed) await assert.rejects(command, /write failed/)
      else await command()
      assert.deepEqual(
        events,
        failed ? ['write'] : ['write', 'refresh'],
        operation
      )
    }
})

test('native command response hooks refresh successful writes, preserve failures and ignore GET responses', async () => {
  for (const success of [true, false]) {
    let refreshes = 0,
      captured
    const actor = { uid: 'actor', getIdToken: async () => 'token' }
    const factory = load(
      '../../../../extensions/fireux-jobs/src/runtime/job/composables/useJobCommand.ts',
      'useJobCommand',
      {
        ref,
        watch,
        useAuth: () => ({ currentUser: ref(actor) }),
        useRequireUser: async () => actor,
        useFireUXConfig: () => ({ appId: 'app' }),
        useRoute: () => ({ fullPath: '/workspace/jobs' }),
        useUserSession: () => ({
          appUser: ref({ role: 'admin' }),
          appPending: ref(false),
          appError: ref(null),
          appOutcome: ref('ready'),
        }),
        useCommandScope: () => () => () => true,
        refreshNuxtData: async () => {
          refreshes++
        },
        $fetch: async (_path, options) => {
          captured = options
          await options.onResponse({ options, response: { ok: success } })
          if (!success) throw new Error('request rejected')
          return { ok: true }
        },
      }
    )
    const scope = effectScope()
    try {
      const controller = scope.run(() => factory())
      const command = () =>
        controller.command('/api/internal/jobs', 'POST', { name: 'Job' })
      if (success) assert.deepEqual(await command(), { ok: true })
      else await assert.rejects(command, /request rejected/)
      assert.equal(refreshes, success ? 1 : 0)
      assert.equal(captured.headers.Authorization, 'Bearer token')
      assert.deepEqual(captured.body, { name: 'Job' })
      await captured.onResponse({
        options: { method: 'GET' },
        response: { ok: true },
      })
      assert.equal(refreshes, success ? 1 : 0)
    } finally {
      scope.stop()
    }
  }
})
