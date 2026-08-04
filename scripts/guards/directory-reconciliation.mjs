// @fireux-script
// last_used: 2026-07-19
// usage_note: run through pnpm guard; locks the read-only directory cutover contract.
// Concurrent edit — 2026-07-19 17:08 CEST — Directory Authority Cutover: guard reconciliation safety, parity, derived counts, and publication state.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import {
  appRelationIssues,
  classifyExpectedDirectoryRecord,
  extractPlatformAppMetadata,
  projectAppDirectoryEntry,
  projectEcosystemDirectoryEntry,
  publicFieldDiffs,
} from '../_lib/platform-directory-reconciliation.mjs'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const script = read(repoRoot, 'scripts/reconcile-platform-directory.mjs')
  const contract = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/models/operations/directory-publication.ts'
  )

  assert.match(script, /mode:\s*'read-only'/)
  assert.match(script, /gcloud[\s\S]*firestore[\s\S]*databases[\s\S]*describe/)
  assert.match(script, /getFirestore\(admin\.app, target\.databaseId\)/)
  assert.match(script, /resolveFirebaseAdminCredential/)
  assert.match(script, /platform-directory-reconciliation\/v1|PLATFORM_DIRECTORY_RECONCILIATION_VERSION/)
  assert.match(script, /fireux_repo|extractPlatformAppMetadata/)
  assert.match(script, /configuredOwners/)
  assert.match(script, /expected\.ambiguous/)
  assert.match(script, /platformDerivedAppIds/)
  assert.match(script, /derivedCountIssues/)
  assert.doesNotMatch(script, /APP_REGISTRY|migrate\.mjs/)
  assert.doesNotMatch(script, /--(?:commit|apply|write)\b/)
  assert.doesNotMatch(
    script,
    /\b(?:setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction|BulkWriter)\b|\b(?:document|batch|transaction|writer)\.(?:set|update|delete|create)\(/
  )

  for (const collection of [
    'directory-app-projections',
    'directory-ecosystem-projections',
    'directory-publication-receipts',
    'directory-curation',
    'directory-sources',
  ]) {
    assert.match(contract, new RegExp(`['\"]${collection}['\"]`))
  }
  assert.match(contract, /action:\s*'upsert'/)
  assert.match(contract, /action:\s*'retire'/)
  assert.match(contract, /source_event_time:\s*string/)
  assert.match(contract, /compareDirectoryPublicationOrderV1/)
  assert.match(contract, /state:\s*'active'/)
  assert.match(contract, /state:\s*'retired'/)
  assert.match(contract, /payload\?:\s*never/)
  assert.match(contract, /retired_at:\s*string/)
  assert.match(contract, /retired_by_event_id:\s*string/)
  assert.match(contract, /status:\s*'active'/)
  assert.match(contract, /oidc_subject:\s*string/)
  assert.match(contract, /service_account_email:\s*string/)
  assert.match(contract, /allowed_entity_kinds:\s*DirectoryEntityKind\[\]/)
  assert.match(contract, /allowed_app_ids:\s*string\[\]/)
  assert.match(contract, /allowed_ecosystem_ids:\s*string\[\]/)
  assert.match(contract, /fixed audience/)
  assert.match(contract, /one transaction/)
  assert.match(contract, /launch_order:\s*number/)
  assert.match(contract, /'id' \| 'detail_url' \| 'status'/)
  assert.match(
    contract,
    /'id' \| 'detail_url' \| 'app_count' \| 'status'/
  )

  const requireFromCore = createRequire(
    path.join(repoRoot, 'packages/core/fireux-core/package.json')
  )
  const { createJiti } = requireFromCore('jiti')
  const jiti = createJiti(import.meta.url, { moduleCache: false })
  const [coreAppProjection, coreEcosystemProjection, publicationContract] =
    await Promise.all([
      jiti.import(
        path.join(
          repoRoot,
          'packages/core/fireux-core/src/runtime/server/utils/public-projection/public-app.dto.ts'
        )
      ),
      jiti.import(
        path.join(
          repoRoot,
          'packages/core/fireux-core/src/runtime/server/utils/public-projection/public-ecosystem.dto.ts'
        )
      ),
      jiti.import(
        path.join(
          repoRoot,
          'packages/core/fireux-core/src/runtime/models/operations/directory-publication.ts'
        )
      ),
    ])

  runFixtures({
    coreAppProjection,
    coreEcosystemProjection,
    publicationContract,
  })
  console.log('[guard] ✅ directory reconciliation contract valid')
}

function runFixtures({
  coreAppProjection,
  coreEcosystemProjection,
  publicationContract,
}) {
  const ownerApp = {
    project_id: 'misebox',
    ecosystem_id: 'misebox',
    slug: 'misebox-app',
    status: 'active',
    app_name: 'Misebox',
    app_short_name: 'Misebox',
    role: 'global',
    tagline: 'Kitchen operations',
    description: 'Owner description',
    short_bio: 'Owner bio',
    derived: { user_count: 4 },
    media: { logo_url: '/logo.svg' },
  }
  const platformApp = structuredClone(ownerApp)
  platformApp.fireux_repo = { launch_order: 7 }
  const ownerProjection = projectAppDirectoryEntry(ownerApp, 'misebox-app')
  const platformProjection = projectAppDirectoryEntry(
    platformApp,
    'misebox-app'
  )
  const canonicalAppProjection = coreAppProjection.toAppDirectoryEntry(
    coreAppProjection.projectPublicApp(ownerApp, { id: 'misebox-app' })
  )

  assert.deepEqual(Object.keys(ownerProjection).sort(), [
    'app_name',
    'app_short_name',
    'derived',
    'description',
    'detail_url',
    'ecosystem_id',
    'id',
    'media',
    'role',
    'short_bio',
    'slug',
    'status',
    'tagline',
  ])
  assert.deepEqual(publicFieldDiffs(ownerProjection, platformProjection), [])
  assert.deepEqual(
    ownerProjection,
    canonicalAppProjection,
    'The audit projector must stay identical to the runtime App directory projector.'
  )
  assert.deepEqual(extractPlatformAppMetadata(platformApp), { launch_order: 7 })
  assert.deepEqual(
    appRelationIssues(ownerApp, {
      projectId: 'misebox',
      ecosystemId: 'misebox',
    }),
    []
  )
  assert.deepEqual(
    appRelationIssues(ownerApp, {
      projectId: 'misebox',
      ecosystemId: 'fireux-misebox',
    }),
    ['ecosystem_id'],
    'Package binding ids must not replace canonical Ecosystem entity ids.'
  )

  assert.equal(
    classifyExpectedDirectoryRecord({
      ownerReadable: true,
      platformReadable: true,
      owner: ownerApp,
      platform: platformApp,
      ownerStatus: 'active',
      relationIssues: [],
      publicDiffs: [],
    }),
    'MATCHED'
  )
  assert.equal(
    classifyExpectedDirectoryRecord({
      ownerReadable: true,
      platformReadable: true,
      owner: ownerApp,
      platform: platformApp,
      ownerStatus: 'active',
      relationIssues: [],
      publicDiffs: ['description'],
    }),
    'PUBLIC_DRIFT'
  )
  assert.equal(
    classifyExpectedDirectoryRecord({
      ownerReadable: true,
      platformReadable: true,
      owner: ownerApp,
      platform: platformApp,
      ownerStatus: 'active',
      relationIssues: [],
      derivedCountIssues: ['app_count'],
      publicDiffs: [],
    }),
    'DERIVED_COUNT_DRIFT'
  )
  assert.equal(
    classifyExpectedDirectoryRecord({
      ownerReadable: true,
      platformReadable: true,
      owner: ownerApp,
      platform: platformApp,
      ownerStatus: 'active',
      relationIssues: ['owner.project_id'],
      publicDiffs: [],
    }),
    'RELATION_DRIFT'
  )
  assert.equal(
    classifyExpectedDirectoryRecord({
      ownerReadable: true,
      platformReadable: true,
      owner: ownerApp,
      platform: platformApp,
      ownerStatus: 'archived',
      relationIssues: [],
      publicDiffs: [],
    }),
    'INACTIVE_OWNER'
  )
  assert.equal(
    classifyExpectedDirectoryRecord({
      ownerReadable: true,
      platformReadable: true,
      owner: ownerApp,
      platform: null,
    }),
    'MISSING_PLATFORM'
  )
  assert.equal(
    classifyExpectedDirectoryRecord({
      ownerReadable: false,
      platformReadable: true,
      owner: null,
      platform: platformApp,
    }),
    'UNREADABLE_OWNER'
  )

  const ecosystemProjection = projectEcosystemDirectoryEntry(
    {
      slug: 'misebox',
      status: 'active',
      name: 'Misebox',
      description: 'Food and hospitality',
      image_url: '/ecosystem.svg',
      website_url: 'https://misebox.com',
    },
    'misebox',
    4
  )
  const canonicalEcosystemProjection =
    coreEcosystemProjection.projectEcosystemDirectoryEntry(
      {
        slug: 'misebox',
        status: 'active',
        name: 'Misebox',
        description: 'Food and hospitality',
        image_url: '/ecosystem.svg',
        website_url: 'https://misebox.com',
      },
      { id: 'misebox', appCount: 4 }
    )
  assert.deepEqual(Object.keys(ecosystemProjection).sort(), [
    'app_count',
    'description',
    'detail_url',
    'id',
    'image_url',
    'name',
    'slug',
    'status',
    'website_url',
  ])
  assert.deepEqual(
    ecosystemProjection,
    canonicalEcosystemProjection,
    'The audit projector must stay identical to the runtime Ecosystem directory projector.'
  )

  const edgeApp = {
    ecosystem_id: 123,
    slug: 456,
    status: 'not-public',
    app_name: '  Edge App  ',
    role: 'invalid-role',
    derived: { user_count: '3.9' },
    media: { logo_url: 789 },
  }
  assert.deepEqual(
    projectAppDirectoryEntry(edgeApp, 'edge-app'),
    coreAppProjection.toAppDirectoryEntry(
      coreAppProjection.projectPublicApp(edgeApp, { id: 'edge-app' })
    ),
    'Projection parity includes invalid values and normalization fallbacks.'
  )

  const compare = publicationContract.compareDirectoryPublicationOrderV1
  const first = {
    event_id: 'event-a',
    revision: { source_event_time: '2026-07-19T15:00:00.000000000Z' },
  }
  const retry = structuredClone(first)
  const later = {
    event_id: 'event-b',
    revision: { source_event_time: '2026-07-19T15:00:00.000000001Z' },
  }
  const sameTimeLaterId = {
    event_id: 'event-b',
    revision: first.revision,
  }
  assert.equal(compare(first, retry), 0)
  assert.equal(compare(first, later), -1)
  assert.equal(compare(later, first), 1)
  assert.equal(compare(first, sameTimeLaterId), -1)
  assert.equal(
    publicationContract.DirectoryPublicationEventTimeV1.test(
      first.revision.source_event_time
    ),
    true
  )
  assert.equal(
    publicationContract.DirectoryPublicationEventTimeV1.test(
      '2026-07-19T15:00:00Z'
    ),
    false
  )
}
