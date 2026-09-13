import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const source = readFileSync(
  new URL('../config/app/meta-content-loader.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.url', JSON.stringify(import.meta.url))
const parse = compileFunction(
  `${stripTypeScriptTypes(source)}; return parseFireuxSolutionsMarkdown`
)()

test('App literature accepts plain checklist items alongside checked and unchecked items', () => {
  assert.deepEqual(
    parse(
      '## Example\n### Checklist\n- Plain item\n- [ ] Pending\n- [x] Finished'
    ).example.checklist,
    [
      { label: 'Plain item', done: false },
      { label: 'Pending', done: false },
      { label: 'Finished', done: true },
    ]
  )
})
