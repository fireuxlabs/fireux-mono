import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, deps, result) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const agent = '../../runtime/kitchen/server/agent/'

for (const operation of ['team', 'menus']) {
  test(`${operation} agent verifies Kitchen authority before inference or tools`, async () => {
    for (const allowed of [false, true]) {
      const calls = []
      const run = load(
        agent + 'run.ts',
        {
          requireKitchenWriter: async (_event, target) => {
            calls.push(['authority', target])
            if (!allowed) throw Error('denied')
            return { kitchenId: target.kitchenId }
          },
          runKitchenTeamAI: async () => {
            calls.push(['team'])
            return 'team'
          },
          selectKitchenWorkspaceAction: async () => null,
          answerKitchenAgent: async () => {
            calls.push(['answer'])
            return 'answer'
          },
          answerKitchenAgentOrientation: async () => {
            throw Error('Unexpected orientation')
          },
        },
        'runKitchenAgent'
      )
      const request = { operation, appId: 'app', kitchenId: 'kitchen' }
      if (allowed)
        assert.equal(
          await run({}, request),
          operation === 'team' ? 'team' : 'answer'
        )
      else await assert.rejects(run({}, request), /denied/)
      assert.deepEqual(calls[0], [
        'authority',
        { appId: 'app', kitchenId: 'kitchen' },
      ])
      assert.equal(calls.length, allowed ? 2 : 1)
    }
  })
}

test('Request parsing admits only the selected Kitchen capability tools', async () => {
  const tools = [
    { id: 'menu.available', status: 'available' },
    { id: 'menu.ready', status: 'agent-ready' },
    { id: 'menu.future', status: 'requested' },
  ]
  const operation = { toolCatalogue: tools }
  const body = {
    appId: 'app',
    kitchenId: 'kitchen',
    operation: 'menus',
    prompt: '  Review this Menu  ',
    availableActions: [
      'menu.available',
      'menu.ready',
      'menu.future',
      'foreign',
      'menu.available',
    ],
    actionTargets: [
      { actionId: 'menu.available', targetId: 'menu', label: 'Dinner' },
      { actionId: 'menu.future', targetId: 'menu', label: 'Unavailable' },
      {
        actionId: 'menu.available',
        targetId: 'foreign/menu',
        label: 'Invalid',
      },
    ],
  }
  const read = load(
    agent + 'request.ts',
    {
      readBody: async () => body,
      createError: (value) => Object.assign(Error(value.statusMessage), value),
      requirePathSegment: (value) => value,
      pendingTeamTool: () => null,
      findKitchenOperationAgent: (name) =>
        name === 'menus' ? operation : undefined,
      kitchenWorkspaceAgent: { operationAgents: [operation] },
    },
    'readKitchenAgentRequest'
  )
  const result = await read({})
  assert.equal(result.prompt, 'Review this Menu')
  assert.deepEqual(result.availableActions, ['menu.available', 'menu.ready'])
  assert.deepEqual(result.actionTargets, [
    { actionId: 'menu.available', targetId: 'menu', label: 'Dinner' },
  ])
})

test('The native agent HTTP adapter delegates to Kitchen-owned request and execution', async () => {
  const request = { appId: 'app', kitchenId: 'kitchen' }
  const event = {}
  const handler = load(
    '../../runtime/server/api/workspace/kitchen/agent.post.ts',
    {
      defineEventHandler: (handler) => handler,
      readKitchenAgentRequest: async (actual) => {
        assert.equal(actual, event)
        return request
      },
      runKitchenAgent: async (actual, input) => {
        assert.equal(actual, event)
        assert.equal(input, request)
        return { ok: true }
      },
    },
    'handler'
  )
  assert.deepEqual(await handler(event), { ok: true })
})
