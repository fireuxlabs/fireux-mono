import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(new URL('../config/app/fireux.config.ts', import.meta.url), 'utf8')
const body = source.slice(source.indexOf('  const layers ='), source.indexOf('  const appDatabaseRuntimeModule'))
const resolveLayers = compileFunction(`${stripTypeScriptTypes(body)}\nreturn nuxt.extends`, ['app'])
test('Core defaults last but explicit precedence and deduplication are preserved', () => {
 assert.deepEqual(resolveLayers({}), ['fireux-core/layer'])
 assert.deepEqual(resolveLayers({extends: ['one', 'two']}), ['one', 'two', 'fireux-core/layer'])
 assert.deepEqual(resolveLayers({extends: ['fireux-core/layer', 'one']}), ['fireux-core/layer', 'one'])
 assert.deepEqual(resolveLayers({extends: ['one', 'fireux-core/layer', 'two']}), ['one', 'fireux-core/layer', 'two'])
 assert.deepEqual(resolveLayers({extends: ['one', 'fireux-core/layer', 'one', 'fireux-core/layer']}), ['one', 'fireux-core/layer'])
 assert.deepEqual(resolveLayers({extends: 'one'}), ['one', 'fireux-core/layer'])
})
