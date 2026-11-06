import assert from 'node:assert/strict'
import test from 'node:test'
import { withDefaultAppLayers, withDefaultAppModules } from '../defaults.ts'

const defaults = [
  'fireux-core/layer',
  'fireux-blogs/layer',
  'fireux-products/layer',
  'fireux-ai/layer',
]

test('App layers include Core, Blogs, Products and AI without changing explicit precedence', () => {
  assert.deepEqual(withDefaultAppLayers([]), defaults)
  assert.deepEqual(withDefaultAppLayers(['one', 'two']), [
    'one',
    'two',
    ...defaults,
  ])
  assert.deepEqual(withDefaultAppLayers(['one', 'fireux-core/layer', 'two']), [
    'one',
    'fireux-core/layer',
    'two',
    'fireux-blogs/layer',
    'fireux-products/layer',
    'fireux-ai/layer',
  ])
  assert.deepEqual(withDefaultAppLayers(['fireux-products/layer', 'one']), [
    'fireux-products/layer',
    'one',
    'fireux-core/layer',
    'fireux-blogs/layer',
    'fireux-ai/layer',
  ])
})

test('App layers deduplicate explicit declarations and leave the caller array unchanged', () => {
  const layers = ['one', 'fireux-core/layer', 'one', 'fireux-core/layer']
  assert.deepEqual(withDefaultAppLayers(layers), ['one', ...defaults])
  assert.deepEqual(layers, [
    'one',
    'fireux-core/layer',
    'one',
    'fireux-core/layer',
  ])
})

test('App modules add Blogs, Products and AI while preserving configured module options', () => {
  assert.deepEqual(withDefaultAppModules(undefined), [
    'fireux-blogs',
    'fireux-products',
    'fireux-ai',
  ])
  const products = ['fireux-products', { mode: 'catalogue' }]
  const modules = ['custom-module', products]
  const resolved = withDefaultAppModules(modules)
  assert.deepEqual(resolved, [
    'fireux-blogs',
    'fireux-ai',
    'custom-module',
    products,
  ])
  assert.equal(resolved[3], products)
  assert.deepEqual(modules, ['custom-module', products])
  assert.deepEqual(withDefaultAppModules(['fireux-products', 'fireux-blogs']), [
    'fireux-ai',
    'fireux-products',
    'fireux-blogs',
  ])
})

test('Explicit AI options are retained without duplicate module or layer registration', () => {
  const ai = ['fireux-ai', { enabled: true, mode: 'simulator' }]
  assert.deepEqual(withDefaultAppModules([ai]), [
    'fireux-blogs',
    'fireux-products',
    ai,
  ])
  const layers = withDefaultAppLayers(['fireux-ai/layer'])
  assert.equal(layers.filter((layer) => layer === 'fireux-ai/layer').length, 1)
  assert.equal(layers[0], 'fireux-ai/layer')
})
