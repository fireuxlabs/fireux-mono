import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
import test from 'node:test'
const source=readFileSync(new URL('../runtime/workspace/server/team/roles.ts',import.meta.url),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
const command=compileFunction(`${stripTypeScriptTypes(source)}; return teamRolesCommand`,['randomUUID','createError','serverAuditStamp'])(()=> 'new-role',x=>new Error(x.statusMessage),()=>({by:'actor'}))
const policy = { fixedRoles: [{ id: 'dev', name: 'Dev' }, { id: 'operator', name: 'Operator' }], fixedRoleRenameMessage: 'Dev and Operator are fixed roles.' }
test('role catalogue creates, renames and validates member assignments',async()=>{
 const roles=new Map([['chef',{name:'Chef'}]])
 const member={role_ids:[]}
 const tx={readAll:async target=>target==='members'?[{id:'person',data:member}]:[...roles].map(([id,data])=>({id,data})),read:async()=>({exists:true,data:member}),create:(_t,id,data)=>roles.set(id,data),update:(target,id,data)=>target==='roles'?roles.set(id,{...roles.get(id),...data}):Object.assign(member,data)}
 await command(tx,'roles','members',{action:'create',name:'Commis'},policy)
 assert.equal(roles.get('new-role').name,'Commis')
 await assert.rejects(command(tx,'roles','members',{action:'create',name:' commis '},policy),/already exists/)
 await assert.rejects(command(tx,'roles','members',{action:'assign',memberId:'person',roleIds:['foreign-role']},policy),/no longer available/)
 await command(tx,'roles','members',{action:'assign',memberId:'person',roleIds:['new-role','chef']},policy)
 assert.deepEqual(member.role_ids,['new-role','chef'])
 await command(tx,'roles','members',{action:'rename',roleId:'new-role',name:'Commis Chef'},policy)
 assert.deepEqual(member.role_ids,['new-role','chef'])
 const read=await command(tx,'roles','members',{action:'read',memberId:'person'},policy)
 assert.equal(read.roles.find(role=>role.id==='new-role').name,'Commis Chef')
 assert.deepEqual(read.labels.person,['Chef','Commis Chef'])
 await command(tx,'roles','members',{action:'assign',memberId:'person',roleIds:['dev']},policy)
 assert.deepEqual(member.role_ids,['dev'])
 await assert.rejects(command(tx,'roles','members',{action:'rename',roleId:'dev',name:'Boss'},policy),/fixed roles/)
 await command(tx,'roles','members',{action:'assign',memberId:'person',roleIds:[]},policy)
 assert.deepEqual(member.role_ids, [])
})
