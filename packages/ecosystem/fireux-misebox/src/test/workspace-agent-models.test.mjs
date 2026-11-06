import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { readFileSync, existsSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root = fileURLToPath(new URL('../../../../../', import.meta.url))
function load(file, deps, result) {
  const source = readFileSync(file, 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
test('Ecosystem agent model exports resolve and Misebox composes Kitchen-owned agent metadata', () => {
  for (const name of ['misebox', 'granite', 'buenohost', 'fireux', 'bringli']) {
    const base = path.join(root, `packages/ecosystem/fireux-${name}`),
      require = createRequire(base + '/package.json')
    assert.equal(
      require.resolve(`fireux-${name}/runtime/models/workspace-agents`),
      base + '/src/runtime/models/workspace-agents.ts'
    )
    assert.equal(
      existsSync(base + '/src/runtime/ai/workspace-agents.ts'),
      false
    )
  }
  const helpers = load(
    path.join(
      root,
      'packages/extensions/fireux-ai/src/runtime/models/agents/operation-agent.ts'
    ),
    {},
    '({advisoryAgentCapabilities,defineFireuxAgentNode,defineFireuxWorkspaceAgent,findFireuxOperationAgent})'
  )
  const menu = { operationSlug: 'menus', id: 'kitchen.menus.ai' }
  const kitchen = load(
    path.join(
      root,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/workspace-agent.ts'
    ),
    { ...helpers, kitchenCapabilityAgents: [menu] },
    '({kitchenWorkspaceAgent,findKitchenOperationAgent})'
  )
  const actual = load(
    new URL('../runtime/models/workspace-agents.ts', import.meta.url),
    { ...helpers, kitchenWorkspaceAgent: kitchen.kitchenWorkspaceAgent },
    '({miseboxAgent,miseboxWorkspaceAgents})'
  )
  assert.equal(actual.miseboxAgent.id, 'misebox.ai')
  assert.equal(kitchen.kitchenWorkspaceAgent.parentId, 'CoreAI')
  assert.equal(kitchen.findKitchenOperationAgent('menus'), menu)
  assert.equal(kitchen.findKitchenOperationAgent('unknown'), undefined)
  assert.equal(actual.miseboxWorkspaceAgents[0].entityTarget.kind, 'Kitchen')
  assert.equal(actual.miseboxWorkspaceAgents[0].parentId, 'MiseboxAI')
  assert.equal(actual.miseboxWorkspaceAgents[0].operationAgents[0], menu)
})
