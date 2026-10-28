import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref } from 'vue'

function feedback(path, name, copy, supported = true) {
  const messages = []
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import .*\n/gm, '')
    .replace(/^export /gm, '')
  const factory = compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    ['ref', 'useToast', 'useClipboard']
  )(
    ref,
    () => ({ add: (message) => messages.push(message) }),
    () => ({
      copy,
      isSupported: ref(supported),
    })
  )
  return { controller: factory(), messages }
}

const toastPath = '../runtime/composables/ui/useToastify.ts'
const diagnosticsPath =
  '../runtime/composables/diagnostics/useDiagnosticsClipboard.ts'

test('shared feedback supplies native duration, semantic tone and a working copy action', async () => {
  const copied = []
  const { controller, messages } = feedback(
    toastPath,
    'useToastify',
    async (text) => copied.push(text)
  )
  controller.error('The operation was denied.')
  assert.equal(messages[0].color, 'error')
  assert.equal(messages[0].duration, 3000)
  await messages[0].actions[0].onClick()
  assert.deepEqual(copied, ['The operation was denied.'])
  assert.equal(messages.length, 1)
})

for (const supported of [true, false]) {
  test(`copy failure is visible without reporting success (clipboard supported: ${supported})`, async () => {
    let calls = 0
    const { controller, messages } = feedback(
      toastPath,
      'useToastify',
      async () => {
        calls++
        throw new Error('Permission denied')
      },
      supported
    )
    controller.warn('Copy this detail')
    await messages[0].actions[0].onClick()
    assert.equal(calls, supported ? 1 : 0)
    assert.equal(messages[1].title, 'Copy failed')
    assert.equal(messages[1].color, 'error')
  })
}

test('diagnostics retain safe JSON serialization over native clipboard access', async () => {
  const copied = []
  const { controller, messages } = feedback(
    diagnosticsPath,
    'useDiagnosticsClipboard',
    async (text) => copied.push(text)
  )
  const value = { size: 12n }
  value.self = value
  assert.equal(await controller.copyJSON(value), true)
  assert.deepEqual(JSON.parse(copied[0]), { size: '12', self: '[Circular]' })
  assert.equal(messages[0].color, 'success')
  assert.equal(controller.copying.value, false)
})

test('diagnostics reject overlapping copies and release their busy state after failure for retry', async () => {
  let rejectCopy
  let calls = 0
  const { controller, messages } = feedback(
    diagnosticsPath,
    'useDiagnosticsClipboard',
    async () => {
      if (++calls === 1)
        await new Promise((_resolve, reject) => {
          rejectCopy = reject
        })
    }
  )
  const pending = controller.copyText('first')
  assert.equal(controller.copying.value, true)
  assert.equal(await controller.copyText('overlapping'), false)
  rejectCopy(new Error('Permission denied'))
  assert.equal(await pending, false)
  assert.equal(controller.copying.value, false)
  assert.equal(await controller.copyText('retry'), true)
  assert.equal(calls, 2)
  assert.deepEqual(
    messages.map(({ color }) => color),
    ['error', 'success']
  )
})
