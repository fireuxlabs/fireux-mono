import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
import test from 'node:test'
const source=readFileSync(new URL('../runtime/place/server/identity/mutation-authority.ts',import.meta.url),'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm,'').replace(/^export /gm,'')
const allow=compileFunction(`${stripTypeScriptTypes(source)};return canKitchenEditPlace`,['isAppUserSubscription'])(v=>['free','premium','business'].includes(v))
const input={uid:'u',placeId:'p',kitchenId:'p',appId:'app',runtimeAppId:'app',kitchenExists:true,membershipExists:true,membership:{role:'user',subscription:'free'},teamExists:true,team:{user_id:'u',status:'active',role:'owner'}}
test('same-id Place edits require current App membership and active exact Team authority',()=>{
 assert.equal(allow(input),true)
 assert.equal(allow({...input,team:{...input.team,role:'operator'}}),true)
 for(const delta of [{kitchenId:'other'},{appId:'foreign'},{kitchenExists:false},{membershipExists:false},{teamExists:false},{membership:{role:'user',subscription:'unknown'}},{team:{...input.team,user_id:'other'}},{team:{...input.team,status:'inactive'}},{team:{...input.team,role:'member'}}]) assert.equal(allow({...input,...delta}),false,JSON.stringify(delta))
})
