import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(
  new URL(
    '../runtime/place/server/identity/mutation-authority.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
const allow = compileFunction(
  `${stripTypeScriptTypes(source)};return canKitchenEditPlace`,
  ['isAppUserSubscription']
)((v) => ['free', 'premium', 'business'].includes(v))
const input={uid:'u',placeId:'p',kitchenId:'p',appId:'app',runtimeAppId:'app',kitchenExists:true,membershipExists:true,membership:{role:'user',subscription:'free',kitchens:['p']}}
test('Kitchen Place editing needs the account association, not a Team role',()=>{
 assert.equal(allow(input),true)
 for(const delta of [{kitchenId:'other'},{appId:'foreign'},{kitchenExists:false},{membershipExists:false},{membership:{role:'user',subscription:'free',kitchens:[]}},{membership:{role:'user',subscription:'unknown',kitchens:['p']}}]) assert.equal(allow({...input,...delta}),false)
})
