import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'
function load(path, result, deps) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const resolveReadOutcome = load(
  '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts',
  'resolveReadOutcome',
  {}
)
function harness() {
  const id = ref('project'),
    user = ref({ uid: 'actor', getIdToken: async () => 'token' })
  const source = { data: ref(null), pending: ref(true), error: ref(null) },
    requests = []
  let read, key
  const make = load(
    '../runtime/project/composables/useProjectEcosystems.ts',
    'useProjectEcosystems',
    {
      computed,
      toValue,
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
      useAuth: () => ({ currentUser: user }),
      useLiveAsyncData: (k, fn, options) => {
        key = k
        read = fn
        assert.deepEqual(options, { server: false })
        return source
      },
    }
  )
  const controller = make(id)
  const run = async (result) =>
    read(async (url, options) => {
      requests.push({ url, options })
      return result
    })
  return { id, user, source, requests, key, controller, run }
}
test('Project Ecosystems uses authenticated live transport and exact returned relationship', async () => {
  const h = harness(),
    rows = [{ id: 'eco', project_id: 'project' }]
  h.source.data.value = await h.run({ project_id: 'project', ecosystems: rows })
  h.source.pending.value = false
  assert.deepEqual(h.requests, [
    {
      url: '/api/internal/control/projects/project/ecosystems',
      options: { headers: { authorization: 'Bearer token' } },
    },
  ])
  assert.deepEqual(h.controller.ecosystems.value, rows)
  assert.equal(h.controller.outcome.value, 'ready')
  h.id.value = 'other'
  assert.deepEqual(h.controller.ecosystems.value, [])
  assert.equal(h.controller.outcome.value, 'pending')
})
test('Failure and sign-out hide retained relationship data', async () => {
  const h = harness()
  h.source.data.value = await h.run({
    project_id: 'project',
    ecosystems: [{ id: 'eco', project_id: 'project' }],
  })
  h.source.pending.value = false
  h.source.error.value = new Error('Unavailable')
  assert.deepEqual(h.controller.ecosystems.value, [])
  assert.equal(h.controller.outcome.value, 'error')
  h.user.value = null
  assert.deepEqual(h.controller.ecosystems.value, [])
  assert.equal(h.controller.outcome.value, 'idle')
})
test('Malformed cross-Project results are rejected, while a settled empty list stays empty', async () => {
  const h = harness()
  await assert.rejects(
    h.run({ project_id: 'other', ecosystems: [] }),
    /did not match/
  )
  await assert.rejects(
    h.run({
      project_id: 'project',
      ecosystems: [{ id: 'foreign', project_id: 'other' }],
    }),
    /did not match/
  )
  h.source.data.value = await h.run({ project_id: 'project', ecosystems: [] })
  h.source.pending.value = false
  assert.equal(h.controller.outcome.value, 'empty')
})
