import { resolveHttpDocumentOutcome } from '../runtime/utils/http-document-outcome.ts'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

test('App detail rejects previous scope data and distinguishes disappearance from failure', async () => {
  const data = ref(),
    error = ref(null),
    pending = ref(false)
  let run
  const source = stripTypeScriptTypes(
    readFileSync(
      new URL('../runtime/app/composables/useAppDetail.ts', import.meta.url),
      'utf8'
    )
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
      .replace(/^export /gm, '')
  )
  const useAppDetail = compileFunction(`${source}; return useAppDetail`, [
    'resolveReadOutcome',
    'resolveHttpDocumentOutcome',
    'computed',
    'toValue',
    'useLiveAsyncData',
  ])(
    resolveReadOutcome,
    resolveHttpDocumentOutcome,
    computed,
    toValue,
    (_key, handler) => {
      run = async () => {
        data.value = await handler(async () => ({
          ok: true,
          item: { id: 'a' },
        }))
      }
      return {
        data,
        error,
        pending,
        refresh: () => run(),
        then: (fn) => Promise.resolve().then(fn),
      }
    }
  )
  const endpoint = ref('/api/apps/a')
  const state = useAppDetail(endpoint)
  await run()
  assert.equal(state.app.value.id, 'a')
  endpoint.value = '/api/apps/b'
  assert.equal(state.app.value, null)
  error.value = { statusCode: 404 }
  assert.equal(state.outcome.value, 'empty')
  error.value = { statusCode: 503 }
  assert.equal(state.outcome.value, 'error')
  assert.equal(state.app.value, null)
  endpoint.value = ''
  assert.equal(state.outcome.value, 'idle')
})
