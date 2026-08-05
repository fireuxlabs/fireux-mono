// @fireux-script
// last_used: 2026-07-24
// usage_note: run through pnpm guard; locks derived AppUser tiers, inherited Premium capability, and sparse optional indexes.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { resolveAppUserAccess } from '../../packages/core/fireux-core/src/runtime/utils/app-user-access.ts'
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
    'packages/core/fireux-core/src/runtime/models/core/user.model.ts'
  )
  const modelStart = model.indexOf('export const AppUserModel: AppUser = {')
  const modelEnd = model.indexOf(
    '\n}\n\nexport type UserCreateInput',
    modelStart
  )
  assert.notEqual(modelStart, -1, 'AppUserModel must remain canonical.')
  assert.notEqual(modelEnd, -1, 'AppUserModel must remain a bounded model.')
  const userAppModel = model.slice(modelStart, modelEnd)
  assert.doesNotMatch(
    userAppModel,
    /\b(?:access_?tier|tier):/,
    'AppUser must not persist the derived access tier.'
  )
  assert.doesNotMatch(
    userAppModel,
    /console_targets/,
    'AppUser must not duplicate entity App-support authority.'
  )

  const mutation = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/app-membership/mutation-contract.ts'
  )
  const initialStart = mutation.indexOf('export function initialMembership(')
  const initialEnd = mutation.indexOf(
    '\nfunction membershipRepairPatch(',
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
    /\bconsole_targets:/,
    'New AppUser memberships must omit empty Console target indexes.'
  )

  const context = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/internal/app/context.get.ts'
  )
  assert.match(context, /profileSnapshots\[index\]\?\.exists/)
  assert.match(
    context,
    /console_enabled: access\.hasAdminAuthority \|\| isConfiguredDeveloper/
  )
  assert.doesNotMatch(context, /console_targets/)
  assert.match(context, /has_premium_access: access\.hasPremiumAccess/)

  const activeUserFetch = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch.ts'
  )
  assert.match(activeUserFetch, /useCurrentAppContext/)
  assert.doesNotMatch(
    activeUserFetch,
    /\b(?:AppStorage|AppUserStorage|normalizeAppUser)\b/,
    'Active User membership must use the bounded current-App server projection.'
  )

  const consoleTargets = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/app/console/useConsoleTargets.ts'
  )
  assert.match(consoleTargets, /useCurrentAppContext/)
  assert.doesNotMatch(
    consoleTargets,
    /useUserFetch/,
    'Generic Console targets must consume the bounded membership projection directly.'
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
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate.ts'
  )
  assert.match(userCreate, /fetchCurrentAppContext/)
  assert.doesNotMatch(
    userCreate,
    /\b(?:getDoc|AppUserStorage)\b/,
    'User provisioning must not inspect App membership through browser Firestore.'
  )

  const membershipMutation = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/appMembershipMutation.ts'
  )
  assert.match(
    membershipMutation,
    /refreshNuxtData\(CURRENT_APP_CONTEXT_ASYNC_DATA_KEY\)/,
    'Membership mutations must refresh the bounded current-App projection.'
  )

  for (const relativePath of [
    'packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules',
    'packages/ecosystem/fireux-werkbox/src/config/firebase/firestore.template.rules',
  ]) {
    const rules = await expandFirestoreRulesTemplate(
      read(repoRoot, relativePath)
    )
    assert.match(rules, /match \/private\/targets[\s\S]*allow get, list, create, update, delete: if false;/)
    assert.doesNotMatch(rules, /data\.profiles|data\.app_ids/)
    assert.doesNotMatch(rules, /console_targets/)
    assert.match(rules, /'pending'[\s\S]*'completed'[\s\S]*'skipped'/)
    assert.match(rules, /allow create, update, delete: if false;/)
  }

  for (const relativePath of [
    'packages/extensions/fireux-properties/src/runtime/server/portfolio/onboarding.ts',
    'packages/extensions/fireux-properties/src/runtime/server/property/onboarding.ts',
    'packages/extensions/fireux-suppliers/src/runtime/server/supplier/onboarding.ts',
  ]) {
    assert.match(
      read(repoRoot, relativePath),
      /hasAppUserPremiumAccess/,
      `${relativePath} must use the shared Premium capability resolver.`
    )
  }

  console.log('[guard] ✅ AppUser access and sparse-index contract is aligned')
}
