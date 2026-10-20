import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(
  new URL('../runtime/kitchen/server/team/intent.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.dev', 'true')
function harness(intent, authenticate = async () => {}) {
  let request, options
  const interpret = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn interpretKitchenTeam`,
    [
      'createError',
      'requireFirebaseBearerUser',
      'useFireUXConfig',
      'useFireuxAi',
      'kitchenTeamAgentTools',
      'kitchenTeamOnboarding',
    ]
  )(
    (error) => Object.assign(new Error(error.statusMessage), error),
    authenticate,
    () => ({ appId: 'test' }),
    (_, value) => {
      options = value
      return {
        generateJson: async (input) => {
          request = input
          return { ok: true, data: { jobTitle: null, ...intent } }
        },
      }
    },
    [
      {
        id: 'kitchen.team.delete-member',
        context: { instruction: 'Deactivate; preserve history.' },
      },
    ],
    { id: 'kitchen.team.onboard', context: 'Review before confirming.' }
  )
  return { interpret, request: () => request, options: () => options }
}
const context = {
  prompt: 'Rename the selected member to Alex',
  selectedId: 'a',
  records: [{ id: 'a', name: 'Before', private: 'excluded' }],
  availableActions: ['read', 'update'],
}
test('Team intent sends bounded context and uses the development Codex transport', async () => {
  const h = harness({
    action: 'update',
    name: ' Alex ',
    message: 'Review this name.',
  })
  assert.equal((await h.interpret({}, context)).name, 'Alex')
  assert.deepEqual(h.request().context.records, [{ id: 'a', name: 'Before', linked: false }])
  assert.equal(h.options().developmentTransport, 'codex')
  assert.equal(h.request().model, undefined)
})
test('Team intent rejects unavailable mutations and missing selection', async () => {
  const h = harness({ action: 'delete', name: '', message: '' })
  assert.equal((await h.interpret({}, context)).action, 'none')
  assert.equal(
    (
      await h.interpret(
        {},
        { ...context, selectedId: '', availableActions: ['delete'] }
      )
    ).action,
    'none'
  )
})
test('Team intent rejects malformed output and authentication failure', async () => {
  await assert.rejects(
    harness({ action: 'update', name: 'x'.repeat(121), message: '' }).interpret(
      {},
      context
    ),
    { statusCode: 502 }
  )
  const h = harness({}, async () => {
    throw new Error('Denied')
  })
  await assert.rejects(h.interpret({}, context), /Denied/)
  assert.equal(h.request(), undefined)
})

test('retired onboarding actions are rejected and legacy AI fields do not enter the person editor', async () => {
  await assert.rejects(harness({action: 'onboard', name: 'Alex', message: ''}).interpret({}, context), {statusCode: 502})
  const result = await harness({action: 'update', name: 'Alex', role: 'operator', jobTitle: 'Chef', message: ''}).interpret({}, context)
  assert.deepEqual(Object.keys(result).sort(), ['action', 'message', 'name'])
})
