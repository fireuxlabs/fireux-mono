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
      actorUid: 'user',
      actorRole: 'user',
    }),
    {
      ok: false,
      statusCode: 403,
      message: 'Self subscription changes are development-only.',
    }
  )
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
  assert.doesNotMatch(
    context,
    /workspace_enabled/,
    'Current App context must not recreate stale Workspace authority on AppUser.'
  )
  assert.doesNotMatch(context, /workspace_targets/)
  assert.match(context, /subscription/)
  assert.doesNotMatch(context, /access_tier|has_premium_access|is_premium/)

  const dashboardOverview = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/Dashboard/Overview.vue'
  )
  assert.match(dashboardOverview, /Boolean\(appUser\.value\)/)
  assert.doesNotMatch(
    dashboardOverview,
    /workspace_enabled/,
    'Workspace entry must come from App membership; entity Team owns selected-target authority.'
  )

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

  const subscriptionControl = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/components/SubscriptionControl.vue'
  )
  assert.match(subscriptionControl, /useSubscriptions/)
  assert.match(
    subscriptionControl,
    /const \{ subscription, subscriptions, next, update \} =\s*useSubscriptions\(subscriptionId\)/
  )
  assert.match(subscriptionControl, /await update\(next\.value\.id\)/)
  assert.doesNotMatch(
    subscriptionControl,
    /mutateAppMembership|set-self-subscription|APP_USER_SUBSCRIPTIONS|useUserUpdate|userId:/
  )
  assert.match(
    subscriptionControl,
    /import\.meta\.dev && currentUser\.value\?\.isAnonymous === false/
  )
  assert.doesNotMatch(subscriptionControl, /useDeveloperAccess|role ===/)
  assert.match(
    subscriptionControl,
    /:to="canToggle \? undefined : '\/pricing'"/
  )
  assert.match(
    subscriptionControl,
    /if \(!canToggle\.value \|\| saving\.value\) return/
  )
  assert.match(subscriptionControl, /@click="toggle"/)
  assert.match(subscriptionControl, /:label="visibleSubscription\.label"/)
  assert.doesNotMatch(subscriptionControl, /appAccess/)
  assert.match(
    subscriptionControl,
    /mounted\.value \? subscription\.value : subscriptions\[0\]!/
  )
  assert.doesNotMatch(subscriptionControl, /controlMode|Loading App access/)
  assert.doesNotMatch(subscriptionControl, /<select/)
  assert.doesNotMatch(subscriptionControl, /<UButtonGroup/)

  const subscriptions = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/useSubscriptions.ts'
  )
  assert.match(
    subscriptions,
    /const subscriptions\s*=\s*\[[\s\S]*id: 'free'[\s\S]*id: 'premium'[\s\S]*id: 'business'/
  )
  assert.match(
    subscriptions,
    /id: AppUserSubscription[\s\S]*color: 'neutral' \| 'warning' \| 'primary'/
  )
  assert.match(
    subscriptions,
    /const update = async[\s\S]*action: 'set-self-subscription'/
  )
  const accessBadge = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/components/AccessBadge.vue'
  )
  assert.match(accessBadge, /useSubscriptions/)
  assert.match(accessBadge, /getSubscription\(props\.subscription\)/)
  assert.doesNotMatch(accessBadge, /const badges\s*=\s*\{/)

  const dashboardNavbar = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/layouts/dashboard/Navbar.vue'
  )
  const workspaceNavbar = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/layouts/workspace/Navbar.vue'
  )
  assert.match(dashboardNavbar, /<UserSubscriptionControl/)
  assert.match(workspaceNavbar, /<LayoutsDashboardNavbar/)
  assert.match(workspaceNavbar, /<UserSubscriptionControl/)
  assert.match(workspaceNavbar, /:show-subscription="false"/)

  const sidebarFooter = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/layouts/shared/SideBarFooter.vue'
  )
  assert.match(sidebarFooter, /to: '\/dashboard\/settings'/)
  assert.match(sidebarFooter, /label: 'Log out'/)
  assert.match(sidebarFooter, /signOutUser\('\/'\)/)
  assert.match(sidebarFooter, /coreOutcome/)
  assert.doesNotMatch(sidebarFooter, /\bisLoading\b/)

  const dashboardLayout = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/layouts/dashboard.vue'
  )
  assert.match(dashboardLayout, /<UDashboardGroup/)
  assert.match(dashboardLayout, /<UDashboardSidebar/)
  assert.match(dashboardLayout, /bg-default\/75/)
  assert.match(dashboardLayout, /<LayoutsSharedRoleBadge/)

  const landingLayout = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/layouts/landing.vue'
  )
  assert.match(landingLayout, /<LayoutsSharedRoleBadge/)

  const workspaceLayout = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/layouts/workspace.vue'
  )
  const roleBadge = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/layouts/shared/RoleBadge.vue'
  )
  const laTapLayout = read(
    repoRoot,
    'projects/misebox/la-tap-berne/app/layouts/latap-default.vue'
  )
  assert.match(workspaceLayout, /<LayoutsSharedRoleBadge/)
  assert.match(laTapLayout, /<LayoutsSharedRoleBadge/)
  assert.match(roleBadge, /useDeveloperAccess/)
  assert.match(
    roleBadge,
    /isDeveloper\.value \|\| appAccess\.value\.role === 'dev'/
  )
  assert.match(roleBadge, /appAccessOutcome\.value !== 'ready'/)
  assert.match(roleBadge, /label: 'Developer'/)

  const subscriptionMutationClient = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/utils/appMembershipMutation.ts'
  )
  assert.match(
    subscriptionMutationClient,
    /await refreshNuxtData\(CURRENT_APP_CONTEXT_ASYNC_DATA_KEY\)/
  )
  assert.match(subscriptionMutationClient, /useNuxtData/)
  assert.match(
    subscriptionMutationClient,
    /membership\?\.id === result\.userId[\s\S]*subscription: result\.subscription/
  )

  const activeUserFetch = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/fetch/useUserFetch.ts'
  )
  assert.match(activeUserFetch, /useCurrentAppContext/)
  assert.match(activeUserFetch, /useCurrentUserAccount/)
  assert.match(
    activeUserFetch,
    /authUser\.value\?\.isAnonymous[\s\S]*useUserIdentitySummary\(identityUid\)/
  )
  assert.doesNotMatch(
    activeUserFetch,
    /\b(?:AppStorage|AppUserStorage|normalizeAppUser|useDocument|useFirestore|useFirestoreRead|firestoreFetchDoc)\b/,
    'Active User and account state must use bounded server projections.'
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
