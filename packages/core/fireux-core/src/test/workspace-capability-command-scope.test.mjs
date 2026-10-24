import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import {
  ref,
  reactive,
  computed,
  watch,
  onScopeDispose,
  effectScope,
} from 'vue'
const root = new URL('../../../../../', import.meta.url)
function load(path, expression, deps = {}) {
  const code = readFileSync(new URL(path, root), 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(code)}; return ${expression}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  'packages/core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)
function deferred() {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}
const specs = [
  [
    'Project',
    'packages/ecosystem/fireux-fireux/src/runtime/project/composables/workspace/test/useProjectWorkspaceTest.ts',
  ],
  [
    'Kitchen',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/test/useKitchenWorkspaceTest.ts',
  ],
]
function client(family, path, responseGate = false) {
  const credentials = deferred(),
    response = deferred(),
    calls = []
  const currentUser = ref({
    uid: 'alice',
    isAnonymous: false,
    getIdToken: () => credentials.promise,
  })
  const appUser = ref({ created: { at: 'one' }, role: 'user' })
  const config = reactive({ appId: 'app-a' })
  const workspace = { id: ref('entity-a') }
  const scope = effectScope()
  const create = load(path, `use${family}WorkspaceTest`, {
    useAuth: () => ({ currentUser }),
    useFireUXConfig: () => config,
    useUserSession: () => ({ appUser }),
    [`use${family}Workspace`]: () => workspace,
    [`use${family}TestRecords`]: () => ({
      records: ref([]),
      pending: ref(false),
      error: ref(null),
    }),
    useCommandScope,
    useWorkspaceTest: (source) => source,
    $fetch: async (url, options) => {
      calls.push({ url, options })
      return responseGate
        ? response.promise
        : {
            ok: true,
            [`${family.toLowerCase()}_id`]: 'entity-a',
            test: { id: 'test-a' },
          }
    },
  })
  return {
    api: scope.run(create),
    scope,
    currentUser,
    appUser,
    config,
    workspace,
    credentials,
    response,
    calls,
  }
}
for (const [family, path] of specs) {
  for (const change of [
    'account ABA',
    'App ABA',
    'Entity ABA',
    'membership replacement',
    'dispose',
  ]) {
    test(`${family} Test rejects ${change} while credentials wait`, async () => {
      const w = client(family, path)
      const pending = w.api.write('PATCH', 'test-a', 'original')
      if (change === 'account ABA') {
        const old = w.currentUser.value
        w.currentUser.value = { ...old, uid: 'bob' }
        w.currentUser.value = old
      }
      if (change === 'App ABA') {
        w.config.appId = 'app-b'
        w.config.appId = 'app-a'
      }
      if (change === 'Entity ABA') {
        w.workspace.id.value = 'entity-b'
        w.workspace.id.value = 'entity-a'
      }
      if (change === 'membership replacement')
        w.appUser.value = { ...w.appUser.value, created: { at: 'two' } }
      if (change === 'dispose') w.scope.stop()
      w.credentials.resolve('token')
      await assert.rejects(pending, /changed/)
      assert.equal(w.calls.length, 0)
      w.scope.stop()
    })
  }
  test(`${family} Test retains a proved commit after UI context changes`, async () => {
    const w = client(family, path, true)
    const pending = w.api.write('PATCH', 'test-a', 'original')
    w.credentials.resolve('token')
    await Promise.resolve()
    await Promise.resolve()
    assert.equal(w.calls.length, 1)
    w.workspace.id.value = 'entity-b'
    w.response.resolve({
      ok: true,
      [`${family.toLowerCase()}_id`]: 'entity-a',
      test: { id: 'test-a' },
    })
    assert.equal((await pending).test.id, 'test-a')
    w.scope.stop()
  })
  test(`${family} Test rejects a response identifying another record`, async () => {
    const w = client(family, path, true)
    const pending = w.api.write('PATCH', 'test-a', 'original')
    w.credentials.resolve('token')
    await Promise.resolve()
    await Promise.resolve()
    w.response.resolve({
      ok: true,
      [`${family.toLowerCase()}_id`]: 'entity-a',
      test: { id: 'test-b' },
    })
    await assert.rejects(pending, /did not match/)
    w.scope.stop()
  })
}
const authorityPath =
  'packages/ecosystem/fireux-fireux/src/runtime/project/server/authority.ts'
const targets = {
  fireuxApps: { collectionPath: 'apps' },
  fireuxEcosystems: { collectionPath: 'ecosystems' },
}
const projectTarget = { collectionPath: 'projects' }
const target = (path) => ({
  collectionPath: path,
  database: { kind: 'named', databaseId: 'fireux' },
})
const actor = { uid: 'alice', appId: 'runtime-app', projectId: 'project-a' }
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), {
    statusCode: input.statusCode,
  })
const requireAuthority = load(
  authorityPath,
  'requireProjectOperatorInTransaction',
  {
    FIRESTORE_MUTATION_TARGETS: targets,
    fireuxAppUsersTarget: (id) => target(`apps/${id}/users`),
    serverProjectAccessTarget: (id) => target(`apps/${id}/project-access`),
    fireuxProjectsTarget: projectTarget,
    readMembershipAccessIds: (access, member) =>
      access?.membership_created_at === member?.created?.at ? access.ids : [],
    requireWorkspaceEntityMemberRole: ({ exists }) => {
      if (!exists)
        throw createError({
          statusCode: 403,
          statusMessage: 'membership required',
        })
    },
    createError,
  }
)
function server(revoked = false, replaced = false) {
  const rows = new Map([
    ['apps/runtime-app', {}],
    ['projects/project-a', {}],
    [
      'apps/runtime-app/users/alice',
      { role: 'user', created: { at: replaced ? 'new' : 'one' } },
    ],
    [
      'apps/runtime-app/project-access/alice',
      { ids: ['project-a'], membership_created_at: 'one' },
    ],
    ['ecosystems/fireux', { project_id: 'project-a' }],
    ['projects/project-a/tests/test-a', { value: 'before' }],
  ])
  if (revoked) rows.delete('apps/runtime-app/users/alice')
  const writes = [],
    reads = []
  const transaction = {
    read: async (t, id) => {
      const key = `${t.collectionPath}/${id}`
      reads.push(key)
      return { exists: rows.has(key), data: rows.get(key) }
    },
    create: (t, id, data) =>
      writes.push(['create', t.collectionPath, id, data]),
    update: (t, id, data) =>
      writes.push(['update', t.collectionPath, id, data]),
    delete: (t, id) => writes.push(['delete', t.collectionPath, id]),
  }
  return { rows, writes, reads, transaction }
}
for (const action of ['create', 'update', 'delete', 'App create']) {
  for (const condition of ['revoked', 'replaced']) {
    test(`Project ${action} performs no write after membership ${condition} since preflight`, async () => {
      const w = server(condition === 'revoked', condition === 'replaced')
      const isApp = action === 'App create'
      const path = isApp
        ? 'packages/ecosystem/fireux-fireux/src/runtime/project/server/apps/create.ts'
        : `packages/ecosystem/fireux-fireux/src/runtime/project/server/test/${action}.ts`
      const name = isApp ? 'createProjectApp' : `${action}ProjectTest`
      const command = load(path, name, {
        createError,
        requireProjectOperator: async () => ({
          ...actor,
          db: {
            collection: () => ({
              doc: () => ({
                collection: () => ({ doc: () => ({ id: 'generated' }) }),
              }),
            }),
          },
        }),
        requireProjectOperatorInTransaction: requireAuthority,
        runGuardedServerTransaction: async (_placement, run) =>
          run(w.transaction),
        fireuxProjectTestsTarget: (id) => target(`projects/${id}/tests`),
        requireFirestoreDocumentId: (id) => id,
        serverAuditStamp: () => ({}),
        serverTimestamp: () => 'now',
        FIRESTORE_MUTATION_TARGETS: targets,
        fireuxAppUsersTarget: (id) => target(`apps/${id}/users`),
        useFireUXConfig: () => ({ ecosystemId: 'fireux' }),
        reconcileAppEcosystemReference: async () => {},
        reconcileUserAppReference: async () => {},
        stamp: () => ({}),
        initialMembership: () => ({}),
      })
      const args = isApp
        ? [
            {},
            'project-a',
            {
              id: 'new-app',
              name: 'New',
              description: '',
              ecosystem_id: 'fireux',
              role: 'tenant',
            },
          ]
        : action === 'create'
          ? [{}, 'project-a', { value: 'after' }]
          : [{}, 'project-a', 'test-a', { value: 'after' }]
      await assert.rejects(command(...args), /membership/)
      assert.deepEqual(w.writes, [])
      assert.ok(w.reads.includes('apps/runtime-app/users/alice'))
    })
  }
}
for (const event of ['draft change', 'modal ABA', 'owner change', 'dispose']) {
  test(`Test Form suppresses obsolete completion after ${event}`, async () => {
    const saveGate = deferred(),
      owner = ref('one'),
      scope = effectScope(),
      emitted = []
    const props = reactive({
      label: 'Create',
      active: true,
      initialValue: undefined,
      submit: async () => saveGate.promise,
      captureIntent: () => {
        const before = owner.value
        return () => owner.value === before
      },
    })
    const form = () =>
      load(
        'packages/core/fireux-core/src/runtime/workspace/components/Test/Form.vue',
        '({ save, value, busy, error })',
        {
          ref,
          watch,
          useCommandScope,
          defineProps: () => props,
          defineEmits:
            () =>
            (...args) =>
              emitted.push(args),
        }
      )
    const ui = scope.run(form)
    ui.value.value = 'original'
    const pending = ui.save()
    if (event === 'draft change') ui.value.value = 'new draft'
    if (event === 'modal ABA') {
      props.active = false
      props.active = true
    }
    if (event === 'owner change') owner.value = 'two'
    if (event === 'dispose') scope.stop()
    saveGate.resolve()
    await pending
    assert.equal(
      ui.value.value,
      event === 'draft change' ? 'new draft' : 'original'
    )
    assert.deepEqual(emitted, [])
    scope.stop()
  })
}
