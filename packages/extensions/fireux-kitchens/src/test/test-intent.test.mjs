import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const source = readFileSync(
  new URL('../runtime/kitchen/server/test/intent.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.dev', 'true')
const context = {
  prompt: 'Rename the selected Test to Hello',
  context: {
    workspace: { id: 'kitchen-a' },
    collection: {
      records: [
        { id: 'a', value: 'Before', secret: 'omit' },
        { id: 'b', value: 'Other' },
      ],
    },
    selected: { id: 'a', value: 'Before' },
    derived: { pending: false, readError: false },
  },
}
function harness(intent, auth = async () => {}) {
  let request
  const interpret = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn interpretKitchenTest`,
    [
      'createError',
      'requireFirebaseBearerUser',
      'useFireUXConfig',
      'useFireuxAi',
    ]
  )(
    (error) => Object.assign(new Error(error.statusMessage), error),
    auth,
    () => ({ appId: 'test' }),
    () => ({
      generateJson: async (input) => {
        request = input
        return { ok: true, data: intent }
      },
    })
  )
  return { interpret, request: () => request }
}
const intent = {
  action: 'update',
  recordId: 'a',
  value: ' Hello ',
  message: 'Review',
}
test('projects bounded records and normalizes a prepared string without writing', async () => {
  const h = harness(intent)
  assert.equal((await h.interpret({}, context)).value, 'Hello')
  assert.deepEqual(h.request().context.records, [
    { id: 'a', value: 'Before' },
    { id: 'b', value: 'Other' },
  ])
  assert.equal(h.request().model, 'gpt-5.4-mini')
})
test('rejects targeting another record, invented ids and empty writes', async () => {
  for (const change of [
    { recordId: 'b' },
    { action: 'delete', recordId: 'b' },
    { action: 'read', recordId: 'unknown' },
    { value: ' ' },
    { action: 'create', recordId: 'a' },
  ])
    assert.equal(
      (await harness({ ...intent, ...change }).interpret({}, context)).action,
      'none'
    )
})
test('accepts create, read, update and delete only within the supplied scope', async () => {
  for (const next of [
    intent,
    { ...intent, action: 'create', recordId: '' },
    { ...intent, action: 'read', recordId: 'b' },
    { ...intent, action: 'delete' },
  ])
    assert.equal(
      (await harness(next).interpret({}, context)).action,
      next.action
    )
})
test('blocks missing selection and loading or malformed context before inference', async () => {
  assert.equal(
    (
      await harness(intent).interpret(
        {},
        { ...context, context: { ...context.context, selected: null } }
      )
    ).action,
    'none'
  )
  for (const modified of [
    null,
    {
      ...context,
      context: {
        ...context.context,
        derived: { pending: true, readError: false },
      },
    },
    {
      ...context,
      context: {
        ...context.context,
        collection: { records: Array(101).fill({ id: 'a', value: 'a' }) },
      },
    },
  ]) {
    const h = harness(intent)
    await assert.rejects(h.interpret({}, modified), { statusCode: 400 })
    assert.equal(h.request(), undefined)
  }
})
test('fails closed for malformed inference and unauthenticated requests', async () => {
  for (const malformed of [
    null,
    { ...intent, action: 'publish' },
    { ...intent, value: 'x'.repeat(121) },
  ]) {
    await assert.rejects(harness(malformed).interpret({}, context), {
      statusCode: 502,
    })
  }
  const h = harness(intent, async () => {
    throw new Error('Denied')
  })
  await assert.rejects(h.interpret({}, context), /Denied/)
  assert.equal(h.request(), undefined)
})
