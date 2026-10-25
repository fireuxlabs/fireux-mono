import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, ref } from 'vue'
const source = readFileSync(new URL('../runtime/workspace/composables/useWorkspacePageNavigation.ts', import.meta.url), 'utf8')
function group(workspace, entry, items, navKey) {
  const current = items.find(item => item.key === navKey)
  const script = source.replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '').replace('export function', 'function')
  return compileFunction(`${stripTypeScriptTypes(script)}; return useWorkspacePageNavigation()`, [
    'computed', 'useRoute', 'useWorkspaceNav', 'useWorkspaceEntryCta', 'toWorkspaceFamilyLabel',
  ])(computed, () => ({path: current.to, meta: {nav: current}}), () => ({items:ref(items),currentWorkspace:ref(workspace)}), () => ({workspaceEntryPath: ref(entry)}), value => value[0].toUpperCase() + value.slice(1))
}
test('Kitchen group framing resolves its own Home, Overview and navigation children', () => {
  const children = [{key:'items',label:'Items',to:'/workspace/kitchen/food-and-drink/items'}]
  const state = group('kitchen','/',[
    {key:'workspace-kitchen-overview',label:'Overview',to:'/workspace/kitchen/overview'},
    {key:'workspace-kitchen-food',label:'Food & drink',to:'/workspace/kitchen/food-and-drink',children},
  ],'workspace-kitchen-food')
  assert.deepEqual(state.breadcrumbs.value,[{label:'Home',to:'/'},{label:'Overview',to:'/workspace/kitchen/overview'},{label:'Food & drink'}])
  assert.deepEqual(state.children.value,children)
})
test('another Workspace keeps its own entry and omits an undeclared Overview', () => {
  const state = group('project','/workspace/project',[
    {key:'workspace-project-delivery',label:'Delivery',to:'/workspace/project/delivery'},
  ],'workspace-project-delivery')
  assert.deepEqual(state.breadcrumbs.value,[{label:'Home',to:'/workspace/project'},{label:'Delivery'}])
  assert.deepEqual(state.children.value,[])
  assert.ok(!source.includes('/workspace/kitchen'))
  assert.ok(!source.includes('<slot'))
})
