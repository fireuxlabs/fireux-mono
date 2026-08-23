// @fireux-script
// last_used: 2026-07-24
// usage_note: run through pnpm guard; locks independent AppUser role/subscription authority and trusted developer subscription control.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { resolveAppUserAccess } from '../../packages/core/fireux-core/src/runtime/app/utils/app-user-access.ts'
import { resolveSubscriptionMutationAuthority } from '../../packages/core/fireux-core/src/runtime/app/server/membership/subscription-authority.ts'
import { expandFirestoreRulesTemplate } from '../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

function assertAccess(input, expected) {
  const access = resolveAppUserAccess(input)
  assert.equal(access.role, expected.role, `${expected.label}: role`)
  assert.deepEqual(
    access.subscription,
    expected.subscription,
    `${expected.label}: subscription`
  )
  assert.equal(
    access.hasMembership,
    expected.hasMembership,
    `${expected.label}: membership`
  )
  assert.deepEqual(
    access.hasAdminAuthority,
    expected.hasAdminAuthority,
    `${expected.label}: Admin authority`
  )
  assert.equal(
    access.hasPremiumSubscription,
    expected.hasPremiumSubscription,
    `${expected.label}: Premium subscription`
  )
  assert.equal(
    access.hasBusinessSubscription,
    expected.hasBusinessSubscription,
    `${expected.label}: Business subscription`
  )
}

export async function run({ repoRoot }) {
  const cases = [
    {
      label: 'missing membership',
      membership: null,
      role: null,
      subscription: 'free',
      hasMembership: false,
      hasAdminAuthority: false,
      hasPremiumSubscription: false,
      hasBusinessSubscription: false,
    },
    {
      label: 'Free member',
      membership: { role: 'user', subscription: 'free' },
      role: 'user',
      subscription: 'free',
      hasMembership: true,
      hasAdminAuthority: false,
      hasPremiumSubscription: false,
      hasBusinessSubscription: false,
    },
    {
      label: 'Premium member',
      membership: { role: 'user', subscription: 'premium' },
      role: 'user',
      subscription: 'premium',
      hasMembership: true,
      hasAdminAuthority: false,
      hasPremiumSubscription: true,
      hasBusinessSubscription: false,
    },
    {
      label: 'Business member',
      membership: { role: 'user', subscription: 'business' },
      role: 'user',
      subscription: 'business',
      hasMembership: true,
      hasAdminAuthority: false,
      hasPremiumSubscription: true,
      hasBusinessSubscription: true,
    },
    {
      label: 'Admin member',
      membership: { role: 'admin', subscription: 'free' },
      role: 'admin',
      subscription: 'free',
      hasMembership: true,
      hasAdminAuthority: true,
      hasPremiumSubscription: false,
      hasBusinessSubscription: false,
    },
    {
      label: 'Free developer',
      membership: { role: 'dev', subscription: 'free' },
      role: 'dev',
      subscription: 'free',
      hasMembership: true,
      hasAdminAuthority: true,
      hasPremiumSubscription: false,
      hasBusinessSubscription: false,
    },
    {
      label: 'Premium developer',
      membership: { role: 'dev', subscription: 'premium' },
      role: 'dev',
      subscription: 'premium',
      hasMembership: true,
      hasAdminAuthority: true,
      hasPremiumSubscription: true,
      hasBusinessSubscription: false,
    },
  ]

  for (const testCase of cases) {
    assertAccess(testCase.membership, testCase)
  }

  assert.deepEqual(
    resolveSubscriptionMutationAuthority({
      action: 'set-self-subscription',
      actorUid: 'developer',
      actorRole: 'dev',
    }),
    { ok: true, userId: 'developer' }
  )
  for (const actorRole of ['user', 'admin']) {
    assert.deepEqual(
      resolveSubscriptionMutationAuthority({
        action: 'set-self-subscription',
        actorUid: actorRole,
        actorRole,
      }),
      { ok: false, statusCode: 403, message: 'Developer access is required.' }
    )
  }
  assert.deepEqual(
    resolveSubscriptionMutationAuthority({
      action: 'set-subscription',
      actorUid: 'admin',
      actorRole: 'admin',
      userId: 'member',
    }),
    { ok: true, userId: 'member' }
  )
  assert.deepEqual(
    resolveSubscriptionMutationAuthority({
      action: 'set-subscription',
      actorUid: 'user',
      actorRole: 'user',
      userId: 'member',
    }),
    { ok: false, statusCode: 403, message: 'App admin access is required.' }
  )

  const model = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/models/app-user.model.ts'
  )
  assert.match(model, /export type AppUser\s*=\s*\{/)
  const userAppModel = model
  assert.match(userAppModel, /role:\s*AppUserRole/)
  assert.match(userAppModel, /subscription:\s*AppUserSubscription/)
  assert.match(userAppModel, /'user', 'admin', 'dev'/)
  assert.match(userAppModel, /'free', 'premium', 'business'/)
  assert.doesNotMatch(
    userAppModel,
    /\b(?:access_?tier|tier|is_premium):/,
    'AppUser must not persist a tier or retired premium flag.'
  )
  assert.doesNotMatch(
    userAppModel,
    /workspace_targets/,
    'AppUser must not duplicate entity App-support authority.'
  )
  assert.match(userAppModel, /created:\s*\{[\s\S]*updated:\s*\{/)
  assert.doesNotMatch(
    userAppModel,
    /app_id/,
    'AppUser must not repeat its owning App id inside the membership document.'
  )

  const mutation = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/server/membership/mutation-contract.ts'
  )
  const initialStart = mutation.indexOf('export function initialMembership(')
  const initialEnd = mutation.indexOf(
    '\nexport function membershipRepairPatch(',
    initialStart
  )
  const initialMembership = mutation.slice(initialStart, initialEnd)
  assert.match(initialMembership, /onboarding_status: 'pending'/)
  assert.match(initialMembership, /subscription: 'free'/)
  assert.doesNotMatch(
    initialMembership,
    /\bprofiles:/,
    'New AppUser memberships must omit an empty profile index.'
  )
  assert.doesNotMatch(
    initialMembership,
    /\bworkspace_targets:/,
    'New AppUser memberships must omit empty Workspace target indexes.'
  )
  assert.doesNotMatch(
    initialMembership,
    /app_id/,
    'New AppUser memberships must not repeat the App id already supplied by the path.'
  )
  assert.doesNotMatch(
    mutation,
    /membershipRepairPatch|coalescing legacy/,
    'Runtime membership repair must not remain a legacy-shape adapter after migration.'
  )
  assert.match(mutation, /export function requireCanonicalMembership/)

  const context = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/server/context/read.ts'
  )
  assert.match(context, /profileSnapshots\[index\]\?\.exists/)
  assert.match(context, /workspace_enabled: access\.hasAdminAuthority/)
  assert.doesNotMatch(context, /workspace_targets/)
  assert.match(context, /subscription/)
  assert.doesNotMatch(context, /access_tier|has_premium_access|is_premium/)

  const settings = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/server/membership/mutation-settings.ts'
  )
  assert.match(settings, /input\.action === 'set-self-subscription'/)
  assert.match(settings, /resolveSubscriptionMutationAuthority/)
  assert.match(
    settings,
    /if \(input\.action === 'set-role'\) \{[\s\S]*requireAdmin\(actorMembership\)/
  )
  assert.doesNotMatch(settings, /isPremium|set-premium|is_premium/)

  const navbar = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/layouts/workspace/Navbar.vue'
  )
  assert.match(navbar, /v-if="isDeveloper"/)
  assert.match(navbar, /action: 'set-self-subscription'/)
  assert.doesNotMatch(navbar, /userId:/)
  assert.match(navbar, /subscriptionPending/)

  const activeUserFetch = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/fetch/useUserFetch.ts'
  )
  assert.match(activeUserFetch, /useCurrentAppContext/)
  assert.match(activeUserFetch, /useCurrentUserAccount/)
  assert.doesNotMatch(
    activeUserFetch,
    /\b(?:AppStorage|AppUserStorage|normalizeAppUser|useDocument|useFirestore)\b/,
    'Active User and account state must use bounded server projections.'
  )

  const workspaceTargets = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/workspace/useWorkspaceTargets.ts'
  )
  assert.match(workspaceTargets, /useWorkspaceTargetRequest/)
  assert.doesNotMatch(
    workspaceTargets,
    /useUserFetch|useCurrentAppContext/,
    'Generic Workspace targets must consume the authenticated family projection directly.'
  )

  const routeAuthGuard = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/utils/routeAuthGuard.ts'
  )
  assert.match(routeAuthGuard, /fetchCurrentAppContext/)
  assert.doesNotMatch(
    routeAuthGuard,
    /firebase\/firestore|AppUserStorage/,
    'Client route authority must use the bounded current-App server projection.'
  )

  const userCreate = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/mutations/useUserCreate.ts'
  )
  assert.match(userCreate, /fetchCurrentAppContext/)
  assert.match(userCreate, /shouldEnsureMembership/)
  assert.match(userCreate, /createAppUserMembership\(appId, uid, 'user'\)/)
  assert.doesNotMatch(
    userCreate,
    /\b(?:getDoc|AppUserStorage)\b/,
    'User provisioning must not inspect App membership through browser Firestore.'
  )

  const userCreateHelpers = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/utils/createHelpers.ts'
  )
  assert.match(userCreateHelpers, /provisionSignedInUserAvatar/)
  assert.doesNotMatch(
    userCreateHelpers,
    /ensureAvatarUrl|useImageStorage/,
    'User onboarding avatars must use the authenticated server Storage boundary.'
  )

  const membershipMutation = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/utils/appMembershipMutation.ts'
  )
  assert.match(
    membershipMutation,
    /refreshNuxtData\(CURRENT_APP_CONTEXT_ASYNC_DATA_KEY\)/,
    'Membership mutations must refresh the bounded current-App projection.'
  )

  const devLauncher = read(repoRoot, 'scripts/dev-app-with-smoke.mjs')
  const developerIdentityStart = devLauncher.indexOf(
    'const inheritedDeveloperIdentityKeys = ['
  )
  const developerIdentityEnd = devLauncher.indexOf(
    'const goQrProvider',
    developerIdentityStart
  )
  assert.notEqual(
    developerIdentityStart,
    -1,
    'The dev launcher must own an inherited developer-identity boundary.'
  )
  const developerIdentityBoundary = devLauncher.slice(
    developerIdentityStart,
    developerIdentityEnd
  )
  for (const key of [
    'DEVELOPER_ID',
    'DEVELOPER_UID',
    'NUXT_PUBLIC_DEVELOPER_ID',
  ]) {
    assert.match(
      developerIdentityBoundary,
      new RegExp(`'${key}'`),
      `${key} must not leak from the parent shell into another App.`
    )
  }
  assert.match(developerIdentityBoundary, /delete devEnv\[key\]/)

  for (const relativePath of [
    'packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules',
    'packages/ecosystem/fireux-werkbox/src/config/firebase/firestore.template.rules',
  ]) {
    const rules = await expandFirestoreRulesTemplate(
      read(repoRoot, relativePath)
    )
    assert.match(
      rules,
      /match \/private\/targets[\s\S]*allow get, list, create, update, delete: if false;/
    )
    assert.doesNotMatch(rules, /data\.profiles|data\.app_ids/)
    assert.doesNotMatch(rules, /workspace_targets/)
    assert.match(rules, /'pending'[\s\S]*'completed'[\s\S]*'skipped'/)
    assert.match(rules, /allow create, update, delete: if false;/)
  }

  console.log('[guard] ✅ AppUser access and sparse-index contract is aligned')
}
