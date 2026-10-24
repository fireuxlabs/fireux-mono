import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source=readFileSync(new URL('../runtime/workspace/utils/sidebar-mode.ts',import.meta.url),'utf8').replace(/^export /gm,'')
const next=compileFunction(stripTypeScriptTypes(source)+';return workspaceSidebarNext')()
test('sidebar cycles compact, expanded, all and advertises each next action',()=>{
  assert.deepEqual(['compact','expanded','all'].map(mode=>next(mode).mode),['expanded','all','compact'])
  assert.equal(next('compact').label,'Expand sidebar')
  assert.equal(next('expanded').label,'Expand all groups')
  assert.equal(next('all').label,'Use compact sidebar')
})
