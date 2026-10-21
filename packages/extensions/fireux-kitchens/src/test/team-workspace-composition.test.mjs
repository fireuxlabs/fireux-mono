import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { compile, computed, createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

const components = {
  kitchen: '../runtime/kitchen/components/Team/Index.vue',
  property: '../../../fireux-properties/src/runtime/property/components/Workspace/Team/Index.vue',
  project: '../../../../ecosystem/fireux-fireux/src/runtime/project/components/Workspace/Team/Index.vue',
}
for (const [domain, path] of Object.entries(components)) test(`${domain} Team reuses shared presentation and retains domain roles and actions`, async () => {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  const script = source.split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const template = source.slice(source.indexOf('<template>') + 10, source.lastIndexOf('</template>'))
  let invites = 0, refreshes = 0, copied = '', shared
  const team = {
    state: ref({ [domain]: { id: 'venue', name: 'Example' }, team: { members: [{ id: 'a', name: 'Alex', userId: '' }], selectedTeamMemberId: 'a' } }),
    derived: ref({ status: 'ready' }), error: ref(null),
    natives: { invite: async id => { assert.equal(id, 'a'); invites++; return { memberName: 'Alex', link: 'test-invitation' } } },
    refresh: () => { refreshes++ },
  }
  const props = { team }
  const names = ['state','derived','rolesEditor','roleLabels', ...(domain === 'property' ? ['updateLabels'] : ['collectionTitle','selectedId','selectedPath','crud']), ...(domain === 'kitchen' ? ['selected','inviteMember','invitingMemberId'] : [])]
  const state = compileFunction(stripTypeScriptTypes(script) + `; return {${names.join(',')}}`, ['computed','ref','defineProps','defineExpose','useToast','navigator'])(computed,ref,()=>props,()=>{},()=>({add(){}}),{clipboard:{writeText: async value => {copied=value}}})
  const app = createSSRApp({setup:()=>({...props,...state}),render:compile(template)})
  app.component('WorkspaceTeamEditor',{props:['team','title','roleLabels'],setup:(p,{slots})=>{shared=p;return()=>h('main',slots.single?.())}})
  let roles
  app.component('WorkspaceTeamRoles',{props:['endpoint','suggestions','workspaceId'],setup:(p,{attrs})=>{roles={...p,...attrs};return()=>h('div')}})
  app.component('WorkspaceTeamAssignment',{setup:()=>()=>h('div')})
  app.component('UButton',{props:['label'],setup:p=>()=>h('button',p.label)})
  const html=await renderToString(app)
  assert.equal(shared.team,team)
  assert.ok(roles.endpoint.includes(domain))
  assert.equal(roles.workspaceId,'venue')
  assert.ok(roles.suggestions.includes(domain==='kitchen'?'Head Chef':domain==='property'?'Host':'Designer'))
  assert.ok(!source.includes('#collection'), 'shared editor owns collection presentation')
  if(domain==='property') { state.updateLabels({a:['Host']}); assert.equal(refreshes,1) }
  else assert.equal(shared.title,'Example’s Team')
  if(domain==='kitchen') {
    assert.match(html,/Copy invitation link/)
    await state.inviteMember(team.state.value.team.members[0])
    assert.equal(invites,1);assert.equal(copied,'test-invitation')
  }
})
