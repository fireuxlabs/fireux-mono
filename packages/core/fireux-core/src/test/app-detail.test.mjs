import { resolveHttpDocumentOutcome } from '../runtime/utils/http-document-outcome.ts'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction as compileNative } from 'node:vm'
let currentReadFetch
const compileFunction = (source, args = []) => {
  const mocks = {
    $fetch: { create: () => currentReadFetch },
    setResponseHeader: () => {},
  }
  const names = Object.keys(mocks).filter((name) => !args.includes(name))
  return compileNative(source, [...names, ...args]).bind(
    null,
    ...names.map((name) => mocks[name])
  )
}
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
    'useAsyncData',
  ])(
    resolveReadOutcome,
    resolveHttpDocumentOutcome,
    computed,
    toValue,
    (_key, handler) => {
      run = async () => {
        data.value = await ((currentReadFetch = async () => ({
          ok: true,
          item: { id: 'a' },
        })),
        handler({}, { signal: new AbortController().signal }))
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
