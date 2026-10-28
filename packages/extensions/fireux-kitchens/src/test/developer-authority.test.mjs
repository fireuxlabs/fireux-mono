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
const accessSource = readFileSync(new URL('../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts', import.meta.url), 'utf8').replace(/^import[^\n]*\n/gm, '').replace(/^export /gm, '')
const readMembershipAccessIds = compileFunction(`${stripTypeScriptTypes(accessSource)};return readMembershipAccessIds`)()
const check = compileFunction(
  `${stripTypeScriptTypes(source)}; return requireKitchenMutationAuthority`,
  [
    'createError',
    'isAppUserSubscription',
    'serverAppUsersTarget',
    'serverKitchenTeamMembersTarget',
    'KITCHEN_MUTATION_TARGETS', 'PLACE_MUTATION_TARGETS', 'serverKitchenAccessTarget', 'readKitchenAccessIds',
  ]
)(
  (x) => Object.assign(new Error(x.statusMessage), x),
  (x) => ['free', 'premium', 'business'].includes(x),
  () => 'app',
  (id) => `team:${id}`,
  { kitchens: 'kitchens' }, { places: 'places' }, () => 'access', readMembershipAccessIds
)
test('Kitchen tools require current membership-bound access, never legacy arrays or Team labels', async () => {
 const actor={uid:'daniel',runtimeAppId:'misebox-app'},stamp={seconds:100,nanoseconds:0}
 let access={ids:['pizza'],membership_created_at:stamp}
 const mutations={read:async target=>target==='app'?{exists:true,data:{role:'user',subscription:'business',kitchens:['pizza'],created:{at:stamp}}}:target==='access'?{exists:true,data:access}:{exists:true,data:{}}}
 await check(mutations,actor,'pizza')
 await assert.rejects(check(mutations,actor,'burger'),/association is required/)
 access={ids:[],membership_created_at:stamp}
 await assert.rejects(check(mutations,actor,'pizza'),/association is required/)
 access={ids:['pizza'],membership_created_at:{seconds:99,nanoseconds:0}}
 await assert.rejects(check(mutations,actor,'pizza'),/association is required/)
})
