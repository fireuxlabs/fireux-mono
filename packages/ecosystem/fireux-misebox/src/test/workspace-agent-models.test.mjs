import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const root = fileURLToPath(new URL('../../../../../', import.meta.url))
test('Maintained Ecosystem agent metadata exports resolve', () => {
  for (const name of ['granite', 'buenohost', 'fireux', 'bringli']) {
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
})
