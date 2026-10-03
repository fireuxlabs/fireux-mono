import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { computed, ref } from 'vue'

const runtime = new URL('../runtime/', import.meta.url)

test('Property navigation uses current authorized choices and suppresses failed or loading choices', () => {
  const source = readFileSync(new URL('property/components/Workspace/Navigation.vue', runtime), 'utf8')
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import .* from .+\n/gm, '')
  const selections = []
  const index = {
    collection: ref([{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }]),
    selectedId: ref('a'), outcome: ref('ready'),
    select: id => { selections.push(id); index.selectedId.value = id },
  }
  const navigation = compileFunction(
    `${stripTypeScriptTypes(source)}; return { item }`,
    ['computed', 'withDefaults', 'defineProps', 'useWorkspaceEntryCta', 'usePropertyWorkspaceIndex', 'usePropertyInterface']
  )(computed, () => ({}), () => ({}), () => ({ workspaceEntryPath: ref('/workspace/property') }),
    () => index, () => ({ pill: value => value ? { id: value.id, title: value.name, imageUrl: '' } : null }))
  assert.equal(navigation.item.value.label, 'Alpha')
  assert.deepEqual(navigation.item.value.choices.map(choice => choice.label), ['Alpha', 'Beta'])
  navigation.item.value.choices[1].onSelect()
  assert.deepEqual(selections, ['b'])
  assert.equal(navigation.item.value.label, 'Beta')
  for (const outcome of ['pending', 'error', 'missing', 'empty']) {
    index.outcome.value = outcome
    assert.equal(navigation.item.value.choices.length, 0, outcome)
    assert.equal(index.selectedId.value, 'b', outcome)
  }
  assert.match(source, /useWorkspaceEntryCta\('property'\)/)
})

test('Property registers one global navigation name for the Core layout resolver', () => {
  const source = readFileSync(new URL('../config/module/components-config.ts', runtime), 'utf8')
    .replace(/^import .* from .+\n/gm, '').replace(/^export /gm, '')
  const directories = [], components = []
  const configure = compileFunction(`${stripTypeScriptTypes(source)}; return configureComponents`,
    ['registerComponentsDir', 'addComponent'])(
    (_resolver, path, options) => directories.push({ path, options }),
    component => components.push(component))
  configure({ resolve: path => path })
  assert.deepEqual(components.filter(component => component.name === 'WorkspacePropertyNavigation'), [{ name: 'WorkspacePropertyNavigation',
    filePath: './runtime/property/components/Workspace/Navigation.vue', global: true }])
  assert.equal(components.length, 2)
  assert.deepEqual(directories.find(directory => directory.path === './runtime/property/components/Workspace').options.ignore, ['Navigation.vue'])
})
