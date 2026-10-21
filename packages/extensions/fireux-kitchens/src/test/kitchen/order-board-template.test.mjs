import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse, compileTemplate } from 'vue/compiler-sfc'

test('order board template compiles, including open-order actions', () => {
  const filename = new URL('../../runtime/kitchen/components/Orders/Board.vue', import.meta.url)
  const source = readFileSync(filename, 'utf8')
  const { descriptor, errors } = parse(source)
  assert.deepEqual(errors, [])
  const compiled = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: 'order-board', compilerOptions: { expressionPlugins: ['typescript'] } })
  assert.deepEqual(compiled.errors, [])
})
