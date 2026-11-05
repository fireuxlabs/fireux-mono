import assert from 'node:assert/strict'
import test from 'node:test'
import { withDefaultAppLayers, withDefaultAppModules } from '../defaults.ts'

const defaults = [
  'fireux-core/layer',
  'fireux-blogs/layer',
  'fireux-products/layer',
]

test('App layers include Core, Blogs and Products without changing explicit precedence', () => {
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
  ])
  assert.deepEqual(withDefaultAppLayers(['fireux-products/layer', 'one']), [
    'fireux-products/layer',
    'one',
    'fireux-core/layer',
    'fireux-blogs/layer',
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

test('App modules add Blogs and Products while preserving configured module options', () => {
  assert.deepEqual(withDefaultAppModules(undefined), [
    'fireux-blogs',
    'fireux-products',
  ])
  const products = ['fireux-products', { mode: 'catalogue' }]
  const modules = ['custom-module', products]
  const resolved = withDefaultAppModules(modules)
  assert.deepEqual(resolved, ['fireux-blogs', 'custom-module', products])
  assert.equal(resolved[2], products)
  assert.deepEqual(modules, ['custom-module', products])
  assert.deepEqual(withDefaultAppModules(['fireux-products', 'fireux-blogs']), [
    'fireux-products',
    'fireux-blogs',
  ])
})
