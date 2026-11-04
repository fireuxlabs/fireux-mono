import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(new URL('../config/app/fireux.config.ts', import.meta.url), 'utf8')
const body = source.slice(source.indexOf('  const layers ='), source.indexOf('  const appDatabaseRuntimeModule'))
const modulesSource = readFileSync(new URL('../config/app/modules.ts', import.meta.url), 'utf8')
const modulesBody = modulesSource
 .slice(modulesSource.indexOf('export const DEFAULT_APP_MODULES'), modulesSource.indexOf('export function moduleName'))
 .replace(/^export /gm, '')
const { withDefaultAppLayers } = compileFunction(
 `${stripTypeScriptTypes(modulesBody)}\nreturn { withDefaultAppLayers }`,
 [])()
const resolveLayers = compileFunction(
 `${stripTypeScriptTypes(body)}\nreturn nuxt.extends`,
 ['app', 'withDefaultAppLayers'])
const resolve = (app) => resolveLayers(app, withDefaultAppLayers)
test('Core and default extension layers are added while explicit order and deduplication are preserved', () => {
 assert.deepEqual(resolve({}), ['fireux-core/layer', 'fireux-blogs/layer', 'fireux-products/layer'])
 assert.deepEqual(resolve({extends: ['one', 'two']}), ['one', 'two', 'fireux-core/layer', 'fireux-blogs/layer', 'fireux-products/layer'])
 assert.deepEqual(resolve({extends: ['fireux-core/layer', 'one']}), ['fireux-core/layer', 'one', 'fireux-blogs/layer', 'fireux-products/layer'])
 assert.deepEqual(resolve({extends: ['one', 'fireux-core/layer', 'two']}), ['one', 'fireux-core/layer', 'two', 'fireux-blogs/layer', 'fireux-products/layer'])
 assert.deepEqual(resolve({extends: ['one', 'fireux-core/layer', 'fireux-blogs/layer', 'fireux-products/layer']}), ['one', 'fireux-core/layer', 'fireux-blogs/layer', 'fireux-products/layer'])
 assert.deepEqual(resolve({extends: ['one', 'fireux-core/layer', 'one', 'fireux-core/layer']}), ['one', 'fireux-core/layer', 'fireux-blogs/layer', 'fireux-products/layer'])
 assert.deepEqual(resolve({extends: 'one'}), ['one', 'fireux-core/layer', 'fireux-blogs/layer', 'fireux-products/layer'])
})
