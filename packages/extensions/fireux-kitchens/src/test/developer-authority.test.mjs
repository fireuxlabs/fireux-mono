import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
import test from 'node:test'
const source = readFileSync(new URL('../runtime/kitchen/server/core/mutation-authority.ts', import.meta.url), 'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
const check = compileFunction(`${stripTypeScriptTypes(source)}; return requireKitchenMutationAuthority`, ['createError','isAppUserSubscription','serverAppUsersTarget','serverKitchenTeamMembersTarget','FIRESTORE_MUTATION_TARGETS'])(x=>Object.assign(new Error(x.statusMessage),x), x=>['free','premium','business'].includes(x),()=> 'app',id=>`team:${id}`,{kitchens:'kitchens',places:'places'})
test('Developer manages only the kitchen with active exact membership',async()=>{
 const actor={uid:'daniel',runtimeAppId:'misebox-app'}
 let member={user_id:'daniel',status:'active',role:'developer'}
 const mutations={read:async target=>target==='app'?{exists:true,data:{role:'dev',subscription:'business'}}:target==='team:pizza'?{exists:true,data:member}:String(target).startsWith('team:')?{exists:false}:{exists:true,data:{}}}
 assert.equal((await check(mutations,actor,'pizza')).teamRole,'developer')
 await assert.rejects(check(mutations,actor,'burger'),/access is required/)
 member={...member,status:'inactive'}
 await assert.rejects(check(mutations,actor,'pizza'),/access is required/)
 member={...member,status:'active',user_id:'someone-else'}
 await assert.rejects(check(mutations,actor,'pizza'),/access is required/)
 member={...member,user_id:'daniel',role:'member'}
 await assert.rejects(check(mutations,actor,'pizza'),/access is required/)
})
