import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(
  new URL(
    '../runtime/kitchen/server/core/mutation-authority.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
const check = compileFunction(
  `${stripTypeScriptTypes(source)}; return requireKitchenMutationAuthority`,
  [
    'createError',
    'isAppUserSubscription',
    'serverAppUsersTarget',
    'serverKitchenTeamMembersTarget',
    'FIRESTORE_MUTATION_TARGETS',
  ]
)(
  (x) => Object.assign(new Error(x.statusMessage), x),
  (x) => ['free', 'premium', 'business'].includes(x),
  () => 'app',
  (id) => `team:${id}`,
  { kitchens: 'kitchens', places: 'places' }
)
test('Kitchen tools need account association, not a Team record or role', async () => {
 const actor={uid:'daniel',runtimeAppId:'misebox-app'}
 let kitchens=['pizza']
 const mutations={read:async target=>target==='app'?{exists:true,data:{role:'user',subscription:'business',kitchens}}:{exists:true,data:{}}}
 await check(mutations,actor,'pizza')
 await assert.rejects(check(mutations,actor,'burger'),/association is required/)
 kitchens=[]
 await assert.rejects(check(mutations,actor,'pizza'),/association is required/)
})
