import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
import test from 'node:test'
const source=readFileSync(new URL('../runtime/server/utils/workspace-team/roles.ts',import.meta.url),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
const command=compileFunction(`${stripTypeScriptTypes(source)}; return teamRolesCommand`,['randomUUID','createError','serverAuditStamp'])(()=> 'new-role',x=>new Error(x.statusMessage),()=>({by:'actor'}))
test('role catalogue creates, renames and validates member assignments',async()=>{
 const roles=new Map([['chef',{name:'Chef'}]])
 const member={status:'active',role_ids:[]}
 const tx={readAll:async target=>target==='members'?[{id:'person',data:member}]:[...roles].map(([id,data])=>({id,data})),read:async()=>({exists:true,data:member}),create:(_t,id,data)=>roles.set(id,data),update:(target,id,data)=>target==='roles'?roles.set(id,{...roles.get(id),...data}):Object.assign(member,data)}
 await command(tx,'roles','members',{action:'create',name:'Commis'},'actor')
 assert.equal(roles.get('new-role').name,'Commis')
 await assert.rejects(command(tx,'roles','members',{action:'create',name:' commis '},'actor'),/already exists/)
 await assert.rejects(command(tx,'roles','members',{action:'assign',memberId:'person',roleIds:['foreign-role']},'actor'),/no longer available/)
 await command(tx,'roles','members',{action:'assign',memberId:'person',roleIds:['new-role','chef']},'actor')
 assert.deepEqual(member.role_ids,['new-role','chef'])
 await command(tx,'roles','members',{action:'rename',roleId:'new-role',name:'Commis Chef'},'actor')
 assert.deepEqual(member.role_ids,['new-role','chef'])
 const read=await command(tx,'roles','members',{action:'read',memberId:'person'},'actor')
 assert.equal(read.roles.find(role=>role.id==='new-role').name,'Commis Chef')
 assert.deepEqual(read.labels.person,['Chef','Commis Chef'])
 member.status='inactive'
 await assert.rejects(command(tx,'roles','members',{action:'assign',memberId:'person',roleIds:[]},'actor'),/active/)
})
