// @fireux-script
// last_used: 2026-08-20
// usage_note: run through pnpm guard; locks root Workspace Entity storage and exact root-owned Team authority.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

const families = [
  [
    'Supplier',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/models/Supplier.model.ts',
    'suppliers/{supplierId}',
    'suppliers/{supplierId}/team/{userId}',
  ],
  [
    'Portfolio',
    'packages/extensions/fireux-properties/src/runtime/portfolio/models/portfolio.model.ts',
    'portfolios/{portfolioId}',
    'portfolios/{portfolioId}/team/{userId}',
  ],
  [
    'Property',
    'packages/extensions/fireux-properties/src/runtime/property/models/property.model.ts',
    'properties/{propertyId}',
    'properties/{propertyId}/team/{userId}',
  ],
  [
    'MarketplaceStore',
    'packages/extensions/fireux-marketplace/src/runtime/marketplace-store/models/marketplace.model.ts',
    'marketplace-stores/{storeId}',
    'marketplace-stores/{storeId}/team/{userId}',
  ],
]

const onboarding = [
  [
    'Kitchen',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/onboarding/commands.ts',
    'serverKitchenTeamMembersTarget',
  ],
  [
    'Supplier',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/server/index/onboarding.ts',
    'serverSupplierTeamMembersTarget',
  ],
  [
    'Portfolio',
    'packages/extensions/fireux-properties/src/runtime/portfolio/server/index/onboarding/onboarding.ts',
    'serverPortfolioTeamMembersTarget',
  ],
  [
    'Property',
    'packages/extensions/fireux-properties/src/runtime/property/server/index/onboarding.ts',
    'serverPropertyTeamMembersTarget',
  ],
]

const collections = [
  [
    'Kitchen',
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/firestore/fetch/useKitchenCollection.ts',
  ],
  [
    'Supplier',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/fetch/useSupplierCollection.ts',
  ],
  [
    'Portfolio',
    'packages/extensions/fireux-properties/src/runtime/portfolio/composables/firestore/fetch/usePortfolioCollection.ts',
  ],
  [
    'Property',
    'packages/extensions/fireux-properties/src/runtime/property/composables/firestore/fetch/usePropertyCollection.ts',
  ],
]

export async function run({ repoRoot = process.cwd() } = {}) {
  for (const conceptPath of [
    'docs/concepts/family-workspace-entity.md',
    'docs/concepts/workspace.md',
  ]) {
    assert.doesNotMatch(
      read(repoRoot, conceptPath),
      /\bConsole\b/,
      `${conceptPath} must use Workspace product vocabulary.`
    )
  }

  const kitchenModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts'
  )
  const kitchenTeam = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/team.ts'
  )
  assert.match(kitchenModel, /export type Kitchen\s*=\s*\{/)
  assert.doesNotMatch(
    kitchenModel,
    /place:\s*Place/,
    'Canonical Kitchen storage must not embed its independently stored Place.'
  )
  assert.doesNotMatch(
    kitchenModel,
    /management|appSupport|management_mode|management_app_id|operator_ids|team_ids/,
    'Kitchen must remain independent of generic Entity/App management metadata.'
  )
  assert.ok(
    kitchenTeam.includes('kitchens/{kitchenId}/team/{memberId}'),
    'Kitchen Team must declare its Kitchen-owned canonical path.'
  )
  const kitchenTeamDeactivate = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/team/delete.ts'
  )
  const kitchenTeamInvitation = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/team/member-invitation.ts'
  )
  assert.match(kitchenTeamDeactivate, /mutations\.delete\(members, memberId\)/)
  assert.doesNotMatch(kitchenTeamInvitation, /member\.data\?\.status/)

  for (const [name, model, root, team, teamModel] of families) {
    const source = [
      read(repoRoot, model),
      teamModel ? read(repoRoot, teamModel) : '',
    ].join('\n')
    assert.ok(
      source.includes("shape: 'root'"),
      name + ' must declare root storage.'
    )
    assert.ok(
      source.includes(root),
      name + ' must declare its canonical root path.'
    )
    assert.ok(
      source.includes(team),
      name + ' must declare its root-owned Team path.'
    )
    assert.match(source, /appSupport:\s*'none'/)
    assert.doesNotMatch(
      source,
      new RegExp('\\bApp' + name + '(?:Storage|Defaults|Model|Record|\\s*=)'),
      name + ' must not restore an App-shadow Entity type.'
    )
    assert.doesNotMatch(
      source,
      /operator_ids|team_ids|join_requests/,
      name + ' root models must not contain authority arrays.'
    )
  }

  for (const [name, file, teamTarget] of onboarding) {
    const source = read(repoRoot, file)
    assert.match(source, /runGuardedServerTransaction/)
    assert.match(source, /serverAppUsersTarget/)
    assert.match(source, new RegExp(teamTarget))
    assert.match(source, /user_id:|buildKitchenTeamMemberRecord/)
    assert.match(source, /status:\s*'active'|buildKitchenTeamMemberRecord/)
    assert.match(source, /created_team_member:/)
    assert.doesNotMatch(
      source,
      /serverApp(?:Kitchens|Suppliers|Portfolios|Properties)Target|operator_ids|team_ids|join_requests|hasAppUserPremiumAccess/,
      name + ' onboarding must write the root and exact Team only.'
    )
  }

  for (const [name, file] of collections) {
    assert.doesNotMatch(
      read(repoRoot, file),
      /apps\//,
      name + ' collection reads must not use App-nested Entity paths.'
    )
  }

  const supplierCollection = read(repoRoot, collections[1][1])
  assert.match(
    supplierCollection,
    /\$fetch<SupplierDirectoryResponse>\('\/api\/suppliers'\)/
  )
  assert.doesNotMatch(supplierCollection, /firestoreFetchCollection/)
  const supplierUpdate = read(
    repoRoot,
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierUpdate.ts'
  )
  assert.match(supplierUpdate, /\/api\/workspace\/supplier\/update/)
  assert.doesNotMatch(supplierUpdate, /useFirestoreUpdate/)
  const supplierServerUpdate = read(
    repoRoot,
    'packages/extensions/fireux-suppliers/src/runtime/supplier/server/identity/update.ts'
  )
  assert.match(supplierServerUpdate, /runGuardedServerTransaction/)
  assert.match(supplierServerUpdate, /serverSupplierTeamMembersTarget/)
  assert.match(supplierServerUpdate, /FIRESTORE_MUTATION_TARGETS\.suppliers/)

  for (const retiredProjectMutation of [
    'projects/fireux/fireux-app/server/project/identity/update.ts',
    'projects/fireux/fireux-app/server/project/identity/delete.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredProjectMutation)),
      false,
      `Provisioned Project identity mutation must not bypass ProjectMeta synchronization: ${retiredProjectMutation}`
    )
  }
  const projectCreate = read(
    repoRoot,
    'projects/fireux/fireux-app/server/project/index/create.ts'
  )
  assert.match(projectCreate, /status:\s*['"]inactive['"]/)
  assert.match(projectCreate, /runGuardedServerTransaction/)
  assert.match(projectCreate, /fireuxProjectTeamMembersTarget/)
  assert.doesNotMatch(
    projectCreate,
    /projectMeta|collection\(['"]project['"]\)/
  )

  const marketplace = [
    read(
      repoRoot,
      'packages/extensions/fireux-marketplace/src/runtime/marketplace-store/server/stores/commands.ts'
    ),
    read(
      repoRoot,
      'packages/extensions/fireux-marketplace/src/runtime/marketplace-store/server/moderation/commands.ts'
    ),
  ].join('\n')
  assert.match(marketplace, /serverMarketplaceStoresTarget/)
  assert.match(marketplace, /serverMarketplaceStoreTeamMembersTarget/)
  assert.doesNotMatch(
    marketplace,
    /serverAppMarketplaceStoresTarget|owner_ids|editor_ids/
  )

  const marketplaceModel = read(repoRoot, families.at(-1)[1])
  assert.match(
    marketplaceModel,
    /MarketplaceOrderStorage[\s\S]*MarketplaceStoreStorage\.path\}\/orders\/\{orderId\}/
  )

  const targets = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/utils/firestore-mutations/server-targets.ts'
  )
  for (const target of [
    'serverKitchenTeamMembersTarget',
    'serverSupplierTeamMembersTarget',
    'serverPortfolioTeamMembersTarget',
    'serverPropertyTeamMembersTarget',
    'fireuxProjectTeamMembersTarget',
    'serverMarketplaceStoreTeamMembersTarget',
  ]) {
    assert.match(targets, new RegExp('export const ' + target))
  }
  assert.doesNotMatch(
    targets,
    /serverApp(?:Properties|Portfolios|Suppliers|Projects|MarketplaceStores)Target|fireuxAppProjectsTarget/
  )
}
