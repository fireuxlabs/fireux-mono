import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(
  new URL('../runtime/project/server/intent.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.dev', 'true')
function harness(intent, auth = async () => {}) {
  let request, options
  const run = compileFunction(
    `${stripTypeScriptTypes(source)}; return interpretProject`,
    [
      'createError',
      'useFireuxAi',
      'useFireUXConfig',
      'requireFirebaseBearerUser',
      'testCapabilityDescription',
    ]
  )(
    (e) => Object.assign(new Error(e.statusMessage), e),
    (_, opts) => {
      options = opts
      return {
        generateJson: async (input) => {
          request = input
          return { ok: true, data: intent }
        },
      }
    },
    () => ({ appId: 'fireux-app' }),
    auth,
    { title: 'Test' }
  )
  return { run, request: () => request, options: () => options }
}
const identity = {
  capability: 'identity',
  prompt: 'Rename this workspace to CleanFlow',
  identity: {
    name: 'Before',
    description: 'Keep',
    imageUrl: '',
    private: 'omit',
  },
  availableActions: ['read', 'update'],
}
const team = {
  capability: 'team',
  prompt: 'Rename the selected teammate to Alex',
  selectedId: 'm',
  records: [{ id: 'm', name: 'Before', role: 'member', private: 'omit' }],
  availableActions: ['read', 'update'],
}
test('Identity preserves omitted fields and sends only bounded context through dev Codex', async () => {
  const h = harness({
    action: 'update',
    name: 'CleanFlow',
    description: null,
    imageUrl: null,
    message: '',
  })
  const result = await h.run({}, identity)
  assert.equal(result.description, null)
  assert.deepEqual(h.request().context.current, {
    name: 'Before',
    description: 'Keep',
    imageUrl: '',
  })
  assert.equal(h.options().developmentTransport, 'codex')
  assert.equal(h.request().model, 'gpt-5.4-mini')
})
test('Team prepares name-only dialogs and rejects unavailable or unselected actions', async () => {
  const h = harness({ action: 'update', name: 'Alex', message: '' })
  assert.deepEqual(await h.run({}, team), {
    action: 'update',
    name: 'Alex',
    message: '',
  })
  assert.deepEqual(h.request().context.records, [{ id: 'm', name: 'Before' }])
  assert.equal((await h.run({}, { ...team, selectedId: '' })).action, 'none')
  assert.equal(
    (await h.run({}, { ...team, availableActions: ['read'] })).action,
    'none'
  )
})
test('invalid model fields and unsafe identity image URLs fail closed', async () => {
  await assert.rejects(
    harness({
      action: 'update',
      name: '',
      description: null,
      imageUrl: null,
      message: '',
    }).run({}, identity),
    { statusCode: 502 }
  )
  await assert.rejects(
    harness({
      action: 'update',
      name: null,
      description: null,
      imageUrl: 'javascript:alert(1)',
      message: '',
    }).run({}, identity),
    { statusCode: 502 }
  )
  await assert.rejects(
    harness({ action: 'update', name: 42, message: '' }).run({}, team),
    { statusCode: 502 }
  )
})
test('authentication and input bounds stop requests before reaching the provider', async () => {
  const denied = harness({}, async () => {
    throw new Error('Denied')
  })
  await assert.rejects(denied.run({}, identity), /Denied/)
  assert.equal(denied.request(), undefined)
  const h = harness({})
  await assert.rejects(h.run({}, { ...team, records: Array(101).fill({}) }), {
    statusCode: 400,
  })
  assert.equal(h.request(), undefined)
})

test('Team model extras cannot become role, access or title changes', async () => {
  const h = harness({
    action: 'create',
    name: 'Alex',
    role: 'operator',
    jobTitle: 'Developer',
    message: '',
  })
  const result = await h.run({}, { ...team, availableActions: ['create'] })
  assert.deepEqual(result, { action: 'create', name: 'Alex', message: '' })
  assert.deepEqual(
    Object.keys(h.request().outputJsonSchema.properties).sort(),
    ['action', 'message', 'name']
  )
  assert.equal(h.request().outputJsonSchema.additionalProperties, false)
})

test('Team role requests remain review guidance for the separate assigned-role controls', async () => {
  const h = harness({
    action: 'none',
    name: '',
    message: 'Use Assigned roles on the selected person.',
  })
  const result = await h.run(
    {},
    { ...team, prompt: 'Assign Operator to this person' }
  )
  assert.equal(result.action, 'none')
  assert.match(result.message, /Assigned roles/)
  assert.match(h.request().context.instruction, /Roles are labels only/)
  assert.match(
    h.request().context.instruction,
    /return none and direct the user to Assigned roles/
  )
})
