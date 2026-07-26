// @fireux-script
// last_used: 2026-07-24
// usage_note: run through pnpm guard; locks derived UserApp tiers, inherited Premium capability, and sparse optional indexes.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { resolveUserAppAccess } from '../../packages/core/fireux-core/src/runtime/models/core/supporting/user-app-access.ts'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

function assertAccess(input, expected) {
  const access = resolveUserAppAccess(input)
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

export function run({ repoRoot }) {
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
  const modelStart = model.indexOf('export const UserAppModel = {')
  const modelEnd = model.indexOf('\n} as const', modelStart)
  const userAppModel = model.slice(modelStart, modelEnd)
  assert.doesNotMatch(
    userAppModel,
    /\b(?:access_?tier|tier):/,
    'UserApp must not persist the derived access tier.'
  )

  const mutation = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/app-membership/mutate.ts'
  )
  const initialStart = mutation.indexOf('function initialMembership(')
  const initialEnd = mutation.indexOf(
    '\nfunction membershipRepairPatch(',
    initialStart
  )
  const initialMembership = mutation.slice(initialStart, initialEnd)
  assert.match(initialMembership, /onboarding_status: 'pending'/)
  assert.doesNotMatch(
    initialMembership,
    /\bprofiles:/,
    'New UserApp memberships must omit an empty profile index.'
  )
  assert.doesNotMatch(
    initialMembership,
    /\bconsole_targets:/,
    'New UserApp memberships must omit empty Console target indexes.'
  )

  const context = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/internal/app/context.get.ts'
  )
  assert.match(context, /value\.profiles \?\? \[\]/)
  assert.match(context, /Object\.entries\(rawTargets \?\? \{\}\)/)
  assert.match(context, /has_premium_access: access\.hasPremiumAccess/)

  const activeUserFetch = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch.ts'
  )
  assert.match(activeUserFetch, /useCurrentAppContext/)
  assert.doesNotMatch(
    activeUserFetch,
    /\b(?:AppStorage|UserAppStorage|normalizeUserApp)\b/,
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
    /firebase\/firestore|UserAppStorage/,
    'Client route authority must use the bounded current-App server projection.'
  )

  const userCreate = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserCreate.ts'
  )
  assert.match(userCreate, /fetchCurrentAppContext/)
  assert.doesNotMatch(
    userCreate,
    /\b(?:getDoc|UserAppStorage)\b/,
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
    const rules = read(repoRoot, relativePath)
    assert.match(rules, /!\('profiles' in data\)/)
    assert.match(rules, /!\('console_targets' in data\)/)
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
      /hasUserAppPremiumAccess/,
      `${relativePath} must use the shared Premium capability resolver.`
    )
  }

  console.log('[guard] ✅ UserApp access and sparse-index contract is aligned')
}
