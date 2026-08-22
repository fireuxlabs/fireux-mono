// @fireux-script
// last_used: 2026-07-24
// usage_note: run through pnpm guard; locks derived AppUser tiers, inherited Premium capability, and sparse optional indexes.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { resolveAppUserAccess } from '../../packages/core/fireux-core/src/runtime/app/utils/app-user-access.ts'
import { expandFirestoreRulesTemplate } from '../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

function assertAccess(input, expected) {
  const access = resolveAppUserAccess(input)
  assert.equal(access.tier, expected.tier, expected.label)
  assert.equal(
    access.hasAdminAuthority,
    expected.hasAdminAuthority,
    `${expected.label}: Admin authority`
  )
  assert.equal(
    access.hasPremiumAccess,
    expected.hasPremiumAccess,
    `${expected.label}: Premium access`
  )
}

export async function run({ repoRoot }) {
  const cases = [
    {
      label: 'missing membership',
      membership: null,
      isConfiguredDeveloper: true,
      tier: null,
      hasAdminAuthority: false,
      hasPremiumAccess: false,
    },
    {
      label: 'Free member',
      membership: { role: 'user', is_premium: false },
      tier: 'free',
      hasAdminAuthority: false,
      hasPremiumAccess: false,
    },
    {
      label: 'Premium member',
      membership: { role: 'user', is_premium: true },
      tier: 'premium',
      hasAdminAuthority: false,
      hasPremiumAccess: true,
    },
    {
      label: 'Admin member',
      membership: { role: 'admin', is_premium: false },
      tier: 'admin',
      hasAdminAuthority: true,
      hasPremiumAccess: true,
    },
    {
      label: 'configured developer member',
      membership: { role: 'user', is_premium: false },
      isConfiguredDeveloper: true,
      tier: 'dev',
      hasAdminAuthority: false,
      hasPremiumAccess: true,
    },
    {
      label: 'configured developer Admin',
      membership: { role: 'admin', is_premium: false },
      isConfiguredDeveloper: true,
      tier: 'dev',
      hasAdminAuthority: true,
      hasPremiumAccess: true,
    },
  ]

  for (const testCase of cases) {
    assertAccess(
      {
        membership: testCase.membership,
        isConfiguredDeveloper: testCase.isConfiguredDeveloper,
      },
      testCase
    )
  }

  const model = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/models/app-user.model.ts'
  )
  assert.match(model, /export type AppUser\s*=\s*\{/)
  const userAppModel = model
  assert.doesNotMatch(
    userAppModel,
    /\b(?:access_?tier|tier):/,
    'AppUser must not persist the derived access tier.'
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
  assert.match(
    context,
    /workspace_enabled: access\.hasAdminAuthority \|\| isConfiguredDeveloper/
  )
  assert.doesNotMatch(context, /workspace_targets/)
  assert.match(context, /has_premium_access: access\.hasPremiumAccess/)

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
