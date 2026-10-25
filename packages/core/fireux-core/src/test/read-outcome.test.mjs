import { resolveHttpDocumentOutcome } from '../runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'

test('read facts classify exactly five outcomes with explicit precedence', () => {
  const base = { enabled: true, pending: false, failed: false, present: true }
  assert.equal(resolveReadOutcome(base), 'ready')
  assert.equal(
    resolveReadOutcome({ ...base, enabled: false, failed: true }),
    'idle'
  )
  assert.equal(resolveReadOutcome({ ...base, pending: true }), 'pending')
  assert.equal(
    resolveReadOutcome({ ...base, pending: true, failed: true }),
    'error'
  )
  assert.equal(resolveReadOutcome({ ...base, present: false }), 'empty')
})

test('HTTP document adapter maps absence before classifying the read', () => {
  const base = { enabled: true, pending: true, present: true }
  assert.equal(
    resolveHttpDocumentOutcome({ ...base, error: { statusCode: 404 } }),
    'empty'
  )
  assert.equal(
    resolveHttpDocumentOutcome({ ...base, error: { status: 404 } }),
    'empty'
  )
  assert.equal(
    resolveHttpDocumentOutcome({ ...base, error: { statusCode: 503 } }),
    'error'
  )
  assert.equal(
    resolveHttpDocumentOutcome({
      ...base,
      enabled: false,
      error: { statusCode: 404 },
    }),
    'idle'
  )
})

import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

test('public Project detail rejects old identities and exposes recoverable read states', () => {
  const data = ref({ item: { id: 'a' } }),
    pending = ref(false),
    error = ref(null)
  const source = readFileSync(
    new URL(
      '../../../../ecosystem/fireux-fireux/src/runtime/project/composables/useProjectDetail.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  const useDetail = compileFunction(
    `${stripTypeScriptTypes(source)}; return useProjectDetail`,
    [
      'computed',
      'toValue',
      'resolveReadOutcome',
      'resolveHttpDocumentOutcome',
      'useLiveAsyncData',
    ]
  )(computed, toValue, resolveReadOutcome, resolveHttpDocumentOutcome, () => ({
    data,
    pending,
    error,
    then: (fn) => Promise.resolve().then(fn),
  }))
  const id = ref('a'),
    read = useDetail(id)
  assert.equal(read.project.value.id, 'a')
  id.value = 'b'
  pending.value = true
  assert.equal(read.project.value, null)
  assert.equal(read.outcome.value, 'pending')
  error.value = { statusCode: 503 }
  assert.equal(read.outcome.value, 'error')
  assert.equal(read.pending.value, false)
  error.value = { statusCode: 404 }
  assert.equal(read.outcome.value, 'empty')
  id.value = ''
  assert.equal(read.outcome.value, 'idle')
  id.value = 'b'
  pending.value = false
  error.value = null
  data.value = { item: { id: 'b' } }
  assert.equal(read.project.value.id, 'b')
})

test('Ecosystem detail reads one canonical record without loading the directory', async () => {
  const data = ref({ ecosystem: { id: 'misebox', project_id: 'owner' } })
  const pending = ref(false),
    error = ref(null)
  let request
  const source = readFileSync(
    new URL(
      '../runtime/ecosystem/composables/useEcosystemDetail.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  const useDetail = compileFunction(
    `${stripTypeScriptTypes(source)}; return useEcosystemDetail`,
    [
      'computed',
      'toValue',
      'resolveReadOutcome',
      'resolveHttpDocumentOutcome',
      'useLiveAsyncData',
    ]
  )(
    computed,
    toValue,
    resolveReadOutcome,
    resolveHttpDocumentOutcome,
    (_key, fetcher) => {
      request = fetcher((url) => url)
      return { data, pending, error, then: (fn) => Promise.resolve().then(fn) }
    }
  )
  const read = useDetail(ref('misebox'))
  assert.equal(request, '/api/ecosystems/misebox')
  assert.equal(read.ecosystem.value.project_id, 'owner')
  error.value = { statusCode: 404 }
  assert.equal(read.outcome.value, 'empty')
  assert.equal(read.ecosystem.value, null)
})

for (const [name, path, key] of [
  [
    'Projects',
    '../../../../ecosystem/fireux-fireux/src/runtime/project/composables/useProjects.ts',
    'items',
  ],
  [
    'KitchenCollection',
    '../../../../extensions/fireux-kitchens/src/runtime/kitchen/composables/useKitchenCollection.ts',
    null,
  ],
]) {
  test(`${name}: a failed read wins over loading and an empty success recovers`, () => {
    const pending = ref(true),
      error = ref(new Error('unavailable'))
    const data = ref(key ? { [key]: [] } : [])
    const source = readFileSync(new URL(path, import.meta.url), 'utf8')
      .replace(/^import[^\n]*\n/gm, '')
      .replace(/^export /gm, '')
    const factory = compileFunction(
      `${stripTypeScriptTypes(source)}; return use${name}`,
      [
        'computed',
        'resolveReadOutcome',
        'resolveHttpDocumentOutcome',
        'useLiveAsyncData',
        'useAuth',
      ]
    )(
      computed,
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
      () => ({
        data,
        pending,
        error,
        refresh: async () => {},
        then: (fn) => Promise.resolve().then(fn),
      }),
      () => ({ currentUser: ref(null), hasAuthState: ref(true) })
    )
    const read = factory()
    assert.equal(read.outcome.value, 'error')
    error.value = null
    assert.equal(read.outcome.value, 'pending')
    pending.value = false
    assert.equal(read.outcome.value, 'empty')
  })
}
