#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-21
// usage_note: produce the exact read-only Werkbox canonical-data plan required before strict Firestore Rules can be released.
// Concurrent edit — 2026-07-21 14:40 CEST — Werkbox Firebase hardening: plan canonical App, identity, membership, handle, Agent, and notification replacements without remote writes.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: preserve bounded public User biography in canonical migration plans.

import { createHash } from 'node:crypto'
import path from 'node:path'
import process from 'node:process'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const PROJECT_ID = 'cleanbox-f15bc'
const DATABASE_ID = 'cleanbox'
const ECOSYSTEM_ID = 'cleanbox'
const MIGRATION_MARKER_PATH =
  'security-migrations/werkbox-firestore-rules-v1'
const HANDLE_STATE_PATH = 'user-handle-state/canonical'
const SERVER_API_CUTOVERS = {
  jobs: 'trusted-api-v1',
  places: 'trusted-api-v1',
  companies: 'trusted-api-v1',
  products: 'disabled-v1',
  blogs: 'disabled-v1',
  professional_structured_experience: 'trusted-api-v1',
  app_admin_people: 'trusted-api-v1',
}
const EXPECTED_APP_IDS = ['cleanbox-app', 'richies-reinigung']
const ROOT_PROFILE_KINDS = ['agent', 'professional']
const ROOT_PROFILE_COLLECTIONS = {
  agent: 'agents',
  professional: 'professionals',
}
const APP_PROFILE_COLLECTIONS = {
  agent: 'agents',
  professional: 'professionals',
}
const KNOWN_DESCENDANT_COLLECTION_IDS = [
  'users',
  'agents',
  'professionals',
  'private',
  'notifications',
  'join-requests',
  'membership-blocks',
]
const ALLOWED_REMOVED_FIELDS = {
  'canonical-user': new Set([
    'adminOf',
    'email',
    'id',
    'notifications',
    'userOf',
  ]),
  'canonical-membership': new Set([
    'workspace_scopes',
    'id',
    'notifications',
  ]),
  'canonical-app': new Set(['admin_ids', 'ecosystem', 'id', 'team']),
  'canonical-agent': new Set(['id']),
  'canonical-app-agent': new Set(['id']),
  'canonical-app-professional': new Set(['id']),
}
const APP_TARGETS = {
  'cleanbox-app': {
    appName: 'Werkbox',
    appShortName: 'Werkbox',
    role: 'global',
    selfJoinEnabled: true,
    repo: {
      key: 'werkbox',
      workspace: './projects/werkbox/werkbox-app',
      launch_order: 3,
      workspace_families: [],
      database_id: DATABASE_ID,
    },
  },
  'richies-reinigung': {
    appName: 'Richies',
    appShortName: 'Richies',
    role: 'tenant',
    selfJoinEnabled: false,
    repo: {
      key: 'richies',
      workspace: './projects/werkbox/richies-reinigung',
      launch_order: 4,
      workspace_families: [],
      database_id: DATABASE_ID,
    },
  },
}
const ALLOWED_ROOT_COLLECTIONS = new Set([
  'agents',
  'apps',
  'blog',
  'blogs',
  'companies',
  'ecosystems',
  'handles',
  'jobs',
  'places',
  'professionals',
  'products',
  'security-migrations',
  'test',
  'user-handles',
  'user-handle-state',
  'users',
])
const ALLOWED_ARGS = new Set([
  'database',
  'help',
  'project',
  'report',
  'service-account',
])

const args = parseArgs(process.argv.slice(2))
for (const token of process.argv.slice(2)) {
  if (!token.startsWith('--')) continue
  const key = token.slice(2).split('=')[0]
  if (['apply', 'commit', 'deploy', 'write'].includes(key)) {
    throw new Error(
      'This planner is read-only. It has no Firebase mutation or Rules deployment path.'
    )
  }
  if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
}

if (args.help) {
  console.log(`
Plan the Werkbox strict-Firestore migration without changing Firebase.

Usage:
  node scripts/plan-werkbox-firestore-migration.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} \\
    [--report /private/tmp/werkbox-firestore-plan.json]

The fixed target is ${PROJECT_ID}/${DATABASE_ID}. The command performs remote
reads only and rejects every mutation/deploy flag. The default terminal output
contains counts and hashes only. --report writes the protected, record-level
plan to a new mode-0600 file under /private/tmp. Record payloads are never
printed to the terminal.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const projectId = requireExactTarget('project', PROJECT_ID)
const databaseId = requireExactTarget('database', DATABASE_ID)
const reportPath = resolveReportPath(args.report)
const resolved = await resolveFirebaseAdminCredential({
  args,
  scope: 'werkbox',
  projectId,
})
const adminApp = initializeApp(
  { credential: resolved.credential, projectId },
  `werkbox-firestore-plan-${Date.now()}`
)
const db = getFirestore(adminApp, databaseId)

try {
  const state = await readState()
  const plan = buildPlan(state)
  let reportArtifact = null
  if (reportPath) {
    reportArtifact = await writeProtectedJsonArtifact({
      path: reportPath,
      payload: plan,
    })
  }
  const output = {
    ...summarize(plan),
    ...(reportArtifact ? { reportArtifact } : {}),
  }
  console.log(JSON.stringify(output, null, 2))
  if (plan.safety.blockers.length) process.exitCode = 2
} finally {
  await deleteApp(adminApp)
}

function requireExactTarget(key, expected) {
  const value = String(args[key] ?? '').trim()
  if (!value) throw new Error(`--${key} ${expected} is required.`)
  if (value !== expected) {
    throw new Error(`This planner only supports --${key} ${expected}.`)
  }
  return value
}

function resolveReportPath(value) {
  if (value == null || value === '') return ''
  const resolvedPath = path.resolve(String(value))
  if (!resolvedPath.startsWith('/private/tmp/')) {
    throw new Error('--report must be a new path under /private/tmp/.')
  }
  return resolvedPath
}

async function listAuthUsers() {
  const users = []
  let pageToken
  do {
    const page = await getAuth(adminApp).listUsers(1000, pageToken)
    users.push(...page.users)
    pageToken = page.pageToken
  } while (pageToken)
  return users
}

async function readCollection(name) {
  return db.collection(name).get()
}

async function readState() {
  const rootCollectionRefs = await db.listCollections()
  const [
    authUsers,
    usersSnapshot,
    appsSnapshot,
    ecosystemsSnapshot,
    agentsSnapshot,
    professionalsSnapshot,
    legacyHandlesSnapshot,
    reservationsSnapshot,
    handleState,
    migrationMarker,
  ] = await Promise.all([
    listAuthUsers(),
    readCollection('users'),
    readCollection('apps'),
    readCollection('ecosystems'),
    readCollection('agents'),
    readCollection('professionals'),
    readCollection('handles'),
    readCollection('user-handles'),
    db.doc(HANDLE_STATE_PATH).get(),
    db.doc(MIGRATION_MARKER_PATH).get(),
  ])

  const users = snapshotMap(usersSnapshot)
  const knownDescendantSnapshots = await Promise.all(
    KNOWN_DESCENDANT_COLLECTION_IDS.map((collectionId) =>
      db.collectionGroup(collectionId).get()
    )
  )
  const privateSnapshots = users.size
    ? await db.getAll(
        ...[...users.keys()].map((uid) =>
          db.doc(`users/${uid}/private/account`)
        )
      )
    : []
  const userDescendants = new Map()
  for (const [uid, userSnapshot] of users) {
    const subcollections = await userSnapshot.ref.listCollections()
    const snapshots = await Promise.all(
      subcollections.map((collection) => collection.get())
    )
    userDescendants.set(uid, {
      subcollectionNames: subcollections.map((collection) => collection.id).sort(),
      collections: new Map(
        snapshots.map((snapshot, index) => [
          subcollections[index].id,
          snapshotMap(snapshot),
        ])
      ),
    })
  }
  const appState = new Map()
  for (const appId of EXPECTED_APP_IDS) {
    const appRef = db.doc(`apps/${appId}`)
    const [memberships, agents, professionals, subcollections] = await Promise.all([
      appRef.collection('users').get(),
      appRef.collection('agents').get(),
      appRef.collection('professionals').get(),
      appRef.listCollections(),
    ])
    appState.set(appId, {
      subcollectionNames: subcollections.map((collection) => collection.id).sort(),
      memberships: snapshotMap(memberships),
      profiles: {
        agent: snapshotMap(agents),
        professional: snapshotMap(professionals),
      },
    })
  }

  return {
    rootCollectionNames: rootCollectionRefs.map((ref) => ref.id).sort(),
    auth: new Map(authUsers.map((user) => [user.uid, user])),
    users,
    userDescendants,
    privateAccounts: new Map(
      privateSnapshots.map((snapshot) => [
        snapshot.ref.parent.parent.id,
        snapshot,
      ])
    ),
    apps: snapshotMap(appsSnapshot),
    ecosystems: snapshotMap(ecosystemsSnapshot),
    agents: snapshotMap(agentsSnapshot),
    professionals: snapshotMap(professionalsSnapshot),
    legacyHandles: snapshotMap(legacyHandlesSnapshot),
    reservations: snapshotMap(reservationsSnapshot),
    handleState,
    migrationMarker,
    appState,
    knownDescendants: new Map(
      knownDescendantSnapshots.map((snapshot, index) => [
        KNOWN_DESCENDANT_COLLECTION_IDS[index],
        snapshot.docs,
      ])
    ),
  }
}

function snapshotMap(snapshot) {
  return new Map(snapshot.docs.map((document) => [document.id, document]))
}

function buildPlan(state) {
  const blockers = []
  const warnings = []
  const operations = []
  const canonicalUsers = new Map()
  const canonicalMemberships = new Map()

  if (state.migrationMarker.exists) {
    blockers.push(
      blocker(
        'MIGRATION_MARKER_ALREADY_EXISTS',
        MIGRATION_MARKER_PATH,
        'The one-time Werkbox migration marker already exists; do not overwrite or replay it.'
      )
    )
  }

  auditRootCollections(state, blockers, warnings)
  auditAuthorityInventory(state, blockers)
  auditDescendantInventory(state, blockers)
  auditKnownDescendantPaths(state, blockers)
  auditProfileRelationships(state, blockers)
  auditHandleInventory(state, blockers)
  const notificationResult = planEmbeddedNotifications(state, blockers)
  operations.push(...notificationResult.operations)

  for (const [uid, userSnapshot] of [...state.users].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const authUser = state.auth.get(uid)
    const userPath = userSnapshot.ref.path
    if (!authUser) {
      blockers.push(blocker('USER_WITHOUT_AUTH', userPath, 'A deletion or retained-identity decision is required.'))
      continue
    }

    const authEmail = normalizeEmail(authUser.email)
    const legacyEmail = normalizeEmail(userSnapshot.get('email'))
    if (!authEmail) {
      blockers.push(blocker('AUTH_EMAIL_MISSING', userPath, 'A retained User requires an Auth email for UserPrivate.'))
    }
    if (legacyEmail && authEmail && legacyEmail !== authEmail) {
      blockers.push(blocker('AUTH_EMAIL_DRIFT', userPath, 'Legacy User email does not match Firebase Auth.'))
    }

    const handle = canonicalHandle(userSnapshot.get('handle'), userPath, blockers)
    const memberships = membershipsForUser(state, uid)
    const profiles = ROOT_PROFILE_KINDS.filter((kind) =>
      state[ROOT_PROFILE_COLLECTIONS[kind]].has(uid)
    )
    const indexedProfiles = canonicalProfileList(userSnapshot.get('profiles'))
    if (
      Array.isArray(userSnapshot.get('profiles')) &&
      stableJson(indexedProfiles) !== stableJson(profiles)
    ) {
      blockers.push(
        blocker(
          'USER_PROFILE_INDEX_DRIFT',
          userPath,
          'Legacy User profile index does not match existing canonical roots.'
        )
      )
    }
    const bio = boundedOptionalString(
      userSnapshot.get('bio'),
      280,
      `${userPath}.bio`,
      blockers
    )
    const created = canonicalCreatedStamp(
      userSnapshot.get('created'),
      `${userPath}.created`,
      blockers
    )
    const updated = canonicalUpdatedStamp(
      userSnapshot.get('updated'),
      `${userPath}.updated`,
      blockers
    )
    const displayName = boundedRequiredString(
      userSnapshot.get('display_name'),
      120,
      `${userPath}.display_name`,
      blockers
    )
    const avatar = canonicalAvatar(
      userSnapshot.get('avatar'),
      `${userPath}.avatar`,
      blockers
    )

    if (created && updated && displayName && handle) {
      const payload = {
        display_name: displayName,
        bio,
        avatar,
        handle,
        app_ids: memberships.map(({ appId }) => appId),
        profiles,
        created,
        updated,
      }
      canonicalUsers.set(uid, payload)
      operations.push(
        replaceOperation(userSnapshot, payload, 'canonical-user', blockers)
      )

      if (authEmail) {
        const privateSnapshot = state.privateAccounts.get(uid)
        const privatePayload = canonicalPrivatePayload({
          snapshot: privateSnapshot,
          authEmail,
          uid,
          fallbackCreated: created,
          fallbackUpdated: updated,
          blockers,
        })
        if (privatePayload) {
          operations.push(
            upsertOperation(
              privateSnapshot,
              `users/${uid}/private/account`,
              privatePayload,
              'canonical-user-private'
            )
          )
        }
      }

      if (handle) {
        planHandleReservation({ state, uid, handle, operations, blockers })
      }
    }
  }

  for (const [uid] of state.auth) {
    if (!state.users.has(uid)) {
      warnings.push({
        code: 'AUTH_IDENTITY_WITHOUT_USER',
        subjectSha256: sha256(uid),
        message: 'Auth-only identity is preserved; no public User is fabricated.',
      })
    }
  }

  for (const appId of EXPECTED_APP_IDS) {
    const scoped = state.appState.get(appId)
    for (const [uid, membershipSnapshot] of [...scoped.memberships].sort(
      ([a], [b]) => a.localeCompare(b)
    )) {
      const path = membershipSnapshot.ref.path
      if (!canonicalUsers.has(uid)) {
        blockers.push(blocker('MEMBERSHIP_WITHOUT_CANONICAL_USER', path, 'Membership cannot survive without a retained canonical User.'))
        continue
      }
      const role = membershipSnapshot.get('role')
      if (!['admin', 'user'].includes(role)) {
        blockers.push(blocker('INVALID_MEMBERSHIP_ROLE', path, 'Role must be admin or user.'))
        continue
      }
      const profiles = ROOT_PROFILE_KINDS.filter((kind) =>
        scoped.profiles[kind].has(uid)
      )
      if (
        Array.isArray(membershipSnapshot.get('profiles')) &&
        stableJson(canonicalProfileList(membershipSnapshot.get('profiles'))) !==
          stableJson(profiles)
      ) {
        blockers.push(
          blocker(
            'MEMBERSHIP_PROFILE_INDEX_DRIFT',
            path,
            'Legacy membership profile index does not match existing App overlays.'
          )
        )
      }
      if (membershipSnapshot.get('workspace_enabled') !== false) {
        blockers.push(
          blocker(
            'LEGACY_CONSOLE_AUTHORITY_REVIEW_REQUIRED',
            path,
            'Werkbox Apps have no workspace families; non-false legacy workspace authority requires review.'
          )
        )
      }
      if (nonEmptyLegacyValue(membershipSnapshot.get('workspace_scopes'))) {
        blockers.push(
          blocker(
            'LEGACY_CONSOLE_SCOPE_REVIEW_REQUIRED',
            path,
            'Non-empty legacy workspace scopes cannot be silently discarded.'
          )
        )
      }
      const created = canonicalCreatedStamp(
        membershipSnapshot.get('created'),
        `${path}.created`,
        blockers,
        { requiredAppId: appId }
      )
      const updated = canonicalUpdatedStamp(
        membershipSnapshot.get('updated'),
        `${path}.updated`,
        blockers
      )
      if (!['free', 'premium'].includes(membershipSnapshot.get('subscription'))) {
        blockers.push(
          blocker(
            'MEMBERSHIP_SUBSCRIPTION_INVALID',
            path,
            'Subscription must be free or premium.'
          )
        )
      }
      if (!created || !updated) continue
      const payload = {
        role,
        subscription: membershipSnapshot.get('subscription'),
        workspace_enabled: false,
        onboarding_status:
          membershipSnapshot.get('onboarding_status') === 'completed' ||
          membershipSnapshot.get('onboarding_status') === 'skipped'
            ? membershipSnapshot.get('onboarding_status')
            : 'pending',
        ...(profiles.length ? { profiles } : {}),
        created,
        updated,
      }
      canonicalMemberships.set(`${appId}/${uid}`, payload)
      operations.push(
        replaceOperation(
          membershipSnapshot,
          payload,
          'canonical-membership',
          blockers
        )
      )

      for (const kind of profiles) {
        const profileSnapshot = scoped.profiles[kind].get(uid)
        const profileCreated = canonicalCreatedStamp(
          profileSnapshot.get('created'),
          `${profileSnapshot.ref.path}.created`,
          blockers,
          { requiredAppId: appId }
        )
        const profileUpdated = canonicalUpdatedStamp(
          profileSnapshot.get('updated'),
          `${profileSnapshot.ref.path}.updated`,
          blockers
        )
        if (profileCreated && profileUpdated) {
          operations.push(
            replaceOperation(
              profileSnapshot,
              { created: profileCreated, updated: profileUpdated },
              `canonical-app-${kind}`,
              blockers
            )
          )
        }
      }
    }
  }

  planRootAgents(state, operations, blockers)
  if (state.professionals.size) {
    for (const snapshot of state.professionals.values()) {
      blockers.push(
        blocker(
          'PROFESSIONAL_REQUIRES_DOMAIN_REVIEW',
          snapshot.ref.path,
          'Structured Professional records are not guessed by the identity migration.'
        )
      )
    }
  }

  for (const appId of EXPECTED_APP_IDS) {
    const snapshot = state.apps.get(appId)
    if (!snapshot) continue
    const payload = canonicalAppPayload({
      appId,
      snapshot,
      memberCount: state.appState.get(appId).memberships.size,
      memberships: state.appState.get(appId).memberships,
      blockers,
    })
    if (payload) {
      operations.push(
        replaceOperation(snapshot, payload, 'canonical-app', blockers)
      )
    }
  }

  const reservationCount = operations.filter(
    (operation) => operation.family === 'canonical-user-handle'
  ).length
  operations.push(
    upsertOperation(
      state.handleState,
      HANDLE_STATE_PATH,
      {
        schema_version: 1,
        backfill_complete: true,
        completed_at: serverValue('timestamp'),
        user_count: canonicalUsers.size,
        reservation_count: reservationCount,
      },
      'migration-marker'
    )
  )

  operations.sort(compareOperations)
  const operationSetSha256 = sha256({
    target: { projectId, databaseId },
    operations: operations.map(hashableOperation),
  })
  const complete = blockers.length === 0
  const markerPayload = {
    schema_version: 1,
    complete,
    no_legacy_compatibility: true,
    completed_at: serverValue('timestamp'),
    project_id: projectId,
    database_id: databaseId,
    ecosystem_id: ECOSYSTEM_ID,
    app_ids: [...EXPECTED_APP_IDS],
    user_count: canonicalUsers.size,
    app_user_count: canonicalMemberships.size,
    agent_count: state.agents.size,
    professional_count: state.professionals.size,
    handle_reservation_count: reservationCount,
    canonical_notification_count: notificationResult.count,
    server_api_cutover_version: 1,
    server_api_cutovers: clone(SERVER_API_CUTOVERS),
    operation_set_sha256: operationSetSha256,
    source_backup_sha256: serverValue('protected-backup-sha256'),
  }
  operations.push(
    upsertOperation(
      state.migrationMarker,
      MIGRATION_MARKER_PATH,
      markerPayload,
      'migration-marker'
    )
  )
  operations.sort(compareOperations)

  const counts = countOperations(operations)
  const result = {
    format: 'fireux-werkbox-firestore-migration-plan/1',
    mode: 'dry-run',
    readOnly: true,
    target: {
      projectId,
      databaseId,
      ecosystemId: ECOSYSTEM_ID,
      appIds: EXPECTED_APP_IDS,
    },
    credentialSource: resolved.source,
    inspectedAt: new Date().toISOString(),
    counts: {
      authUsers: state.auth.size,
      users: state.users.size,
      privateAccounts: [...state.privateAccounts.values()].filter(
        (snapshot) => snapshot.exists
      ).length,
      apps: state.apps.size,
      memberships: [...state.appState.values()].reduce(
        (total, scoped) => total + scoped.memberships.size,
        0
      ),
      agents: state.agents.size,
      professionals: state.professionals.size,
      legacyHandles: state.legacyHandles.size,
      canonicalHandleReservations: state.reservations.size,
      ...counts,
    },
    safety: {
      status: complete ? 'ready-for-apply-executor-review' : 'blocked',
      blockers,
      warnings,
    },
    operationSetSha256,
    finalPlanSha256: sha256(operations.map(hashableOperation)),
    operations,
    migrationMarker: {
      path: MIGRATION_MARKER_PATH,
      payload: markerPayload,
    },
    applyBoundary: {
      implemented: false,
      productionMutated: false,
      requiredExecutorControls: [
        `exact target confirmation ${PROJECT_ID}/${DATABASE_ID}`,
        'new exclusive mode-0600 full preimage backup',
        'backup SHA-256 embedded in the migration marker',
        'snapshot update-time rechecks before every write',
        'atomic or bounded-batch writes with no compatibility fallback',
        'post-write exact-shape and count verification',
        'strict Rules release only after trusted server cutovers are deployed',
      ],
    },
  }
  return {
    ...result,
    artifactSha256: sha256({
      format: result.format,
      target: result.target,
      counts: result.counts,
      safety: result.safety,
      operationSetSha256: result.operationSetSha256,
      finalPlanSha256: result.finalPlanSha256,
      operations: result.operations.map(hashableOperation),
      migrationMarker: normalizeForHash(result.migrationMarker),
      applyBoundary: result.applyBoundary,
    }),
  }
}

function auditRootCollections(state, blockers, warnings) {
  for (const name of state.rootCollectionNames) {
    if (!ALLOWED_ROOT_COLLECTIONS.has(name)) {
      blockers.push(
        blocker(
          'UNCLASSIFIED_ROOT_COLLECTION',
          name,
          'Classify this collection before a default-deny release.'
        )
      )
    }
  }
  if (state.legacyHandles.size) {
    warnings.push({
      code: 'LEGACY_HANDLES_RETAINED_LOCKED',
      count: state.legacyHandles.size,
      message: 'Legacy handles remain as rollback evidence but receive no client access.',
    })
  }
  if (state.rootCollectionNames.includes('test')) {
    warnings.push({
      code: 'LEGACY_TEST_COLLECTION_RETAINED_LOCKED',
      message: 'Legacy test data remains in place but receives no client access.',
    })
  }
}

function auditAuthorityInventory(state, blockers) {
  for (const appId of EXPECTED_APP_IDS) {
    if (!state.apps.has(appId)) {
      blockers.push(blocker('EXPECTED_APP_MISSING', `apps/${appId}`, 'Canonical App source is missing.'))
    }
  }
  for (const appId of state.apps.keys()) {
    if (!EXPECTED_APP_IDS.includes(appId)) {
      blockers.push(blocker('UNEXPECTED_APP', `apps/${appId}`, 'Classify this App before fixed-target rules are released.'))
    }
  }
  if (!state.ecosystems.has(ECOSYSTEM_ID)) {
    blockers.push(blocker('ECOSYSTEM_MISSING', `ecosystems/${ECOSYSTEM_ID}`, 'Canonical Ecosystem source is missing.'))
  }
  for (const ecosystemId of state.ecosystems.keys()) {
    if (ecosystemId !== ECOSYSTEM_ID) {
      blockers.push(blocker('UNEXPECTED_ECOSYSTEM', `ecosystems/${ecosystemId}`, 'Classify this Ecosystem before release.'))
    }
  }
  const ecosystem = state.ecosystems.get(ECOSYSTEM_ID)
  if (ecosystem) auditCanonicalEcosystem(ecosystem, blockers)
}

function auditDescendantInventory(state, blockers) {
  for (const [appId, scoped] of state.appState) {
    for (const name of scoped.subcollectionNames) {
      if (!['users', 'agents', 'professionals'].includes(name)) {
        blockers.push(
          blocker(
            'UNCLASSIFIED_APP_SUBCOLLECTION',
            `apps/${appId}/${name}`,
            'Classify this App descendant before strict default-deny release.'
          )
        )
      }
    }
  }

  for (const [uid, descendants] of state.userDescendants) {
    for (const name of descendants.subcollectionNames) {
      if (!['private', 'notifications'].includes(name)) {
        blockers.push(
          blocker(
            'UNCLASSIFIED_USER_SUBCOLLECTION',
            `users/${uid}/${name}`,
            'Classify this User descendant before strict default-deny release.'
          )
        )
      }
    }
    const privateDocuments = descendants.collections.get('private') ?? new Map()
    for (const documentId of privateDocuments.keys()) {
      if (documentId !== 'account') {
        blockers.push(
          blocker(
            'UNCLASSIFIED_USER_PRIVATE_DOCUMENT',
            `users/${uid}/private/${documentId}`,
            'Only the canonical private/account document is supported.'
          )
        )
      }
    }
    const notifications = descendants.collections.get('notifications') ?? new Map()
    for (const snapshot of notifications.values()) {
      auditCanonicalNotification(snapshot, blockers)
    }
  }
}

function auditKnownDescendantPaths(state, blockers) {
  for (const [collectionId, snapshots] of state.knownDescendants) {
    for (const snapshot of snapshots) {
      const parts = snapshot.ref.path.split('/')
      let recognized = false
      if (collectionId === 'users') {
        recognized =
          (parts.length === 2 && parts[0] === 'users') ||
          (parts.length === 4 &&
            parts[0] === 'apps' &&
            EXPECTED_APP_IDS.includes(parts[1]))
      } else if (['agents', 'professionals'].includes(collectionId)) {
        recognized =
          (parts.length === 2 && parts[0] === collectionId) ||
          (parts.length === 4 &&
            parts[0] === 'apps' &&
            EXPECTED_APP_IDS.includes(parts[1]))
      } else if (['private', 'notifications'].includes(collectionId)) {
        recognized =
          parts.length === 4 &&
          parts[0] === 'users' &&
          state.users.has(parts[1]) &&
          (collectionId !== 'private' || parts[3] === 'account')
      } else if (
        ['join-requests', 'membership-blocks'].includes(collectionId)
      ) {
        recognized =
          parts.length === 4 &&
          parts[0] === 'apps' &&
          EXPECTED_APP_IDS.includes(parts[1])
      }
      if (!recognized) {
        blockers.push(
          blocker(
            'ORPHAN_OR_UNCLASSIFIED_DESCENDANT',
            snapshot.ref.path,
            `Known descendant collection ${collectionId} appears outside a retained canonical parent.`
          )
        )
      }
    }
  }
}

function auditProfileRelationships(state, blockers) {
  for (const kind of ROOT_PROFILE_KINDS) {
    const roots = state[ROOT_PROFILE_COLLECTIONS[kind]]
    for (const [uid, snapshot] of roots) {
      if (!state.users.has(uid)) {
        blockers.push(
          blocker(
            'ROOT_PROFILE_WITHOUT_USER',
            snapshot.ref.path,
            'Root profile identity must match a retained User.'
          )
        )
      }
    }
  }

  for (const [appId, scoped] of state.appState) {
    for (const kind of ROOT_PROFILE_KINDS) {
      for (const [uid, snapshot] of scoped.profiles[kind]) {
        if (!scoped.memberships.has(uid)) {
          blockers.push(
            blocker(
              'APP_PROFILE_WITHOUT_MEMBERSHIP',
              snapshot.ref.path,
              'App profile overlay requires a same-User membership.'
            )
          )
        }
        if (!state[ROOT_PROFILE_COLLECTIONS[kind]].has(uid)) {
          blockers.push(
            blocker(
              'APP_PROFILE_WITHOUT_ROOT_PROFILE',
              snapshot.ref.path,
              `App ${kind} overlay requires a same-User root profile.`
            )
          )
        }
        if (!state.users.has(uid)) {
          blockers.push(
            blocker(
              'APP_PROFILE_WITHOUT_USER',
              snapshot.ref.path,
              'App profile overlay requires a retained User.'
            )
          )
        }
      }
    }
    if (!EXPECTED_APP_IDS.includes(appId)) {
      blockers.push(
        blocker(
          'UNEXPECTED_APP_PROFILE_SCOPE',
          `apps/${appId}`,
          'Profile overlays must remain inside a known App.'
        )
      )
    }
  }
}

function auditHandleInventory(state, blockers) {
  for (const [handle, snapshot] of state.legacyHandles) {
    const uid = String(snapshot.get('uid') ?? '').trim()
    const keys = Object.keys(snapshot.data()).sort()
    if (
      stableJson(keys) !== stableJson(['created_at', 'uid', 'updated_at']) ||
      !(snapshot.get('created_at') instanceof Timestamp) ||
      !(snapshot.get('updated_at') instanceof Timestamp) ||
      !state.users.has(uid) ||
      state.users.get(uid).get('handle') !== handle
    ) {
      blockers.push(
        blocker(
          'LEGACY_HANDLE_RELATION_INVALID',
          snapshot.ref.path,
          'Legacy handle must exactly identify its same-handle retained User.'
        )
      )
    }
  }
  for (const [handle, snapshot] of state.reservations) {
    const uid = String(snapshot.get('uid') ?? '').trim()
    if (
      snapshot.get('handle') !== handle ||
      !state.users.has(uid) ||
      state.users.get(uid).get('handle') !== handle
    ) {
      blockers.push(
        blocker(
          'CANONICAL_HANDLE_RELATION_INVALID',
          snapshot.ref.path,
          'Canonical reservation must exactly identify its same-handle retained User.'
        )
      )
    }
  }
}

function auditCanonicalEcosystem(snapshot, blockers) {
  const path = snapshot.ref.path
  const data = snapshot.data()
  const expectedKeys = [
    'created',
    'description',
    'id',
    'image_url',
    'name',
    'project_id',
    'slug',
    'status',
    'updated',
    'website_url',
  ]
  if (
    stableJson(Object.keys(data).sort()) !== stableJson(expectedKeys) ||
    data.id !== ECOSYSTEM_ID ||
    data.project_id !== ECOSYSTEM_ID ||
    data.slug !== ECOSYSTEM_ID ||
    typeof data.name !== 'string' ||
    data.name.trim().length < 1 ||
    data.name.trim().length > 120 ||
    typeof data.description !== 'string' ||
    data.description.length > 4_000 ||
    !['active', 'inactive', 'archived'].includes(data.status) ||
    (data.image_url && !isHttpsUrl(data.image_url)) ||
    (data.website_url && !isHttpsUrl(data.website_url))
  ) {
    blockers.push(
      blocker(
        'ECOSYSTEM_SCHEMA_INVALID',
        path,
        'Stored Ecosystem does not match the fixed canonical Werkbox authority.'
      )
    )
  }
  canonicalCreatedStamp(data.created, `${path}.created`, blockers)
  canonicalUpdatedStamp(data.updated, `${path}.updated`, blockers)
}

function auditCanonicalNotification(snapshot, blockers) {
  const path = snapshot.ref.path
  const data = snapshot.data()
  const created = data.created
  if (
    stableJson(Object.keys(data).sort()) !==
      stableJson(['created', 'message', 'read', 'scope']) ||
    typeof data.message !== 'string' ||
    data.message.length < 1 ||
    data.message.length > 1_000 ||
    !['ecosystem', 'app'].includes(data.scope) ||
    typeof data.read !== 'boolean' ||
    !created ||
    typeof created !== 'object' ||
    Array.isArray(created) ||
    stableJson(Object.keys(created).sort()) !== stableJson(['app_id', 'at']) ||
    !(created.at instanceof Timestamp) ||
    !isCanonicalNotificationAppId(data.scope, created.app_id)
  ) {
    blockers.push(
      blocker(
        'USER_NOTIFICATION_SCHEMA_INVALID',
        path,
        'Existing notification is not canonical owner-only delivery state.'
      )
    )
  }
}

function planEmbeddedNotifications(state, blockers) {
  const operations = []
  let count = 0
  for (const [uid, userSnapshot] of state.users) {
    const sources = [
      {
        path: `${userSnapshot.ref.path}.notifications`,
        value: userSnapshot.get('notifications'),
      },
      ...EXPECTED_APP_IDS.map((appId) => {
        const membership = state.appState.get(appId).memberships.get(uid)
        return {
          path: membership
            ? `${membership.ref.path}.notifications`
            : `apps/${appId}/users/${uid}.notifications`,
          value: membership?.get('notifications'),
        }
      }),
    ]
    const byHash = new Map()
    for (const source of sources) {
      if (source.value == null) continue
      if (!Array.isArray(source.value)) {
        blockers.push(
          blocker(
            'EMBEDDED_NOTIFICATION_LIST_INVALID',
            source.path,
            'Legacy embedded notifications must be a list.'
          )
        )
        continue
      }
      for (let index = 0; index < source.value.length; index += 1) {
        const payload = canonicalNotificationPayload(
          source.value[index],
          `${source.path}[${index}]`,
          blockers
        )
        if (payload) byHash.set(sha256(payload), payload)
      }
    }

    const existing =
      state.userDescendants.get(uid)?.collections.get('notifications') ??
      new Map()
    for (const [payloadSha256, payload] of [...byHash].sort(([a], [b]) =>
      a.localeCompare(b)
    )) {
      const notificationId = `legacy-${payloadSha256.slice(0, 24)}`
      const snapshot = existing.get(notificationId)
      if (
        snapshot?.exists &&
        stableJson(normalizeForHash(snapshot.data())) !==
          stableJson(normalizeForHash(payload))
      ) {
        blockers.push(
          blocker(
            'CANONICAL_NOTIFICATION_CONFLICT',
            snapshot.ref.path,
            'Existing deterministic notification id has different content.'
          )
        )
        continue
      }
      operations.push(
        upsertOperation(
          snapshot,
          `users/${uid}/notifications/${notificationId}`,
          payload,
          'canonical-notification'
        )
      )
      count += 1
    }
  }
  return { count, operations }
}

function canonicalNotificationPayload(value, valuePath, blockers) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    blockers.push(
      blocker(
        'EMBEDDED_NOTIFICATION_INVALID',
        valuePath,
        'Legacy notification must be an object.'
      )
    )
    return null
  }
  const created = value.created
  if (
    stableJson(Object.keys(value).sort()) !==
      stableJson(['created', 'message', 'read', 'scope']) ||
    typeof value.message !== 'string' ||
    value.message.length < 1 ||
    value.message.length > 1_000 ||
    !['ecosystem', 'app'].includes(value.scope) ||
    typeof value.read !== 'boolean' ||
    !created ||
    typeof created !== 'object' ||
    Array.isArray(created) ||
    stableJson(Object.keys(created).sort()) !== stableJson(['app_id', 'at']) ||
    !(created.at instanceof Timestamp) ||
    !isCanonicalNotificationAppId(value.scope, created.app_id)
  ) {
    blockers.push(
      blocker(
        'EMBEDDED_NOTIFICATION_INVALID',
        valuePath,
        'Legacy notification does not match the canonical owner-only shape.'
      )
    )
    return null
  }
  return {
    message: value.message,
    scope: value.scope,
    created: { at: created.at, app_id: created.app_id },
    read: value.read,
  }
}

function isCanonicalNotificationAppId(scope, appId) {
  return scope === 'ecosystem'
    ? appId === ''
    : scope === 'app' && EXPECTED_APP_IDS.includes(appId)
}

function canonicalProfileList(value) {
  const selected = new Set(
    Array.isArray(value)
      ? value.filter((entry) => typeof entry === 'string')
      : []
  )
  return ROOT_PROFILE_KINDS.filter((kind) => selected.has(kind))
}

function nonEmptyLegacyValue(value) {
  if (value == null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

function membershipsForUser(state, uid) {
  return EXPECTED_APP_IDS.flatMap((appId) =>
    state.appState.get(appId).memberships.has(uid) ? [{ appId }] : []
  )
}

function planHandleReservation({ state, uid, handle, operations, blockers }) {
  const existing = state.reservations.get(handle)
  if (existing && existing.get('uid') !== uid) {
    blockers.push(blocker('HANDLE_RESERVATION_CONFLICT', existing.ref.path, 'Reservation belongs to another User.'))
    return
  }
  for (const user of state.users.values()) {
    if (user.id !== uid && String(user.get('handle') ?? '').trim() === handle) {
      blockers.push(blocker('DUPLICATE_USER_HANDLE', user.ref.path, 'Two Users claim the same canonical handle.'))
      return
    }
  }
  const payload = {
    uid,
    handle,
    created_at:
      existing?.get('created_at') instanceof Timestamp
        ? existing.get('created_at')
        : serverValue('timestamp'),
    updated_at:
      existing?.get('updated_at') instanceof Timestamp
        ? existing.get('updated_at')
        : serverValue('timestamp'),
  }
  operations.push(
    upsertOperation(existing, `user-handles/${handle}`, payload, 'canonical-user-handle')
  )
}

function planRootAgents(state, operations, blockers) {
  const stringFields = new Map([
    ['title', 120],
    ['summary', 1_000],
    ['agent_bio', 4_000],
    ['agent_image', 2_048],
    ['agent_contact_email', 320],
    ['agent_contact_phone', 40],
    ['agent_website_url', 2_048],
    ['subtitle', 240],
    ['tagline', 240],
  ])
  const listFields = ['agent_placement_types', 'agent_coverage_areas', 'tags']
  for (const [uid, snapshot] of state.agents) {
    const path = snapshot.ref.path
    if (!state.users.has(uid)) {
      blockers.push(blocker('AGENT_WITHOUT_USER', path, 'Agent identity must match a retained User.'))
      continue
    }
    const created = canonicalCreatedStamp(
      snapshot.get('created'),
      `${path}.created`,
      blockers
    )
    const updated = canonicalUpdatedStamp(
      snapshot.get('updated'),
      `${path}.updated`,
      blockers
    )
    if (!created || !updated) continue
    const payload = {}
    for (const [field, maxLength] of stringFields) {
      const value = snapshot.get(field)
      const normalized = typeof value === 'string' ? value.trim() : ''
      if (normalized.length > maxLength) {
        blockers.push(
          blocker(
            'AGENT_TEXT_TOO_LONG',
            `${path}.${field}`,
            `Value exceeds ${maxLength} characters.`
          )
        )
      }
      if (
        ['agent_image', 'agent_website_url'].includes(field) &&
        normalized &&
        !isHttpsUrl(normalized)
      ) {
        blockers.push(
          blocker(
            'AGENT_URL_INVALID',
            `${path}.${field}`,
            'Non-empty public URLs must use HTTPS.'
          )
        )
      }
      if (
        field === 'agent_contact_email' &&
        normalized &&
        !normalizeEmail(normalized)
      ) {
        blockers.push(
          blocker(
            'AGENT_EMAIL_INVALID',
            `${path}.${field}`,
            'Non-empty Agent contact email must be valid.'
          )
        )
      }
      payload[field] = normalized
    }
    for (const field of listFields) {
      const value = snapshot.get(field)
      if (value == null) {
        payload[field] = []
        continue
      }
      if (
        !Array.isArray(value) ||
        value.length > 20 ||
        value.some(
          (entry) => typeof entry !== 'string' || entry.trim().length > 240
        )
      ) {
        blockers.push(
          blocker(
            'AGENT_LIST_INVALID',
            `${path}.${field}`,
            'Agent list must contain at most 20 strings of at most 240 characters.'
          )
        )
        payload[field] = []
        continue
      }
      payload[field] = value.map((entry) => entry.trim())
    }
    payload.created = created
    payload.updated = updated
    operations.push(
      replaceOperation(snapshot, payload, 'canonical-agent', blockers)
    )
  }
}

function canonicalAppPayload({
  appId,
  snapshot,
  memberCount,
  memberships,
  blockers,
}) {
  const target = APP_TARGETS[appId]
  const path = snapshot.ref.path
  const source = snapshot.data()
  for (const [field, expected] of [
    ['id', appId],
    ['project_id', ECOSYSTEM_ID],
    ['ecosystem_id', ECOSYSTEM_ID],
    ['database_id', DATABASE_ID],
    ['slug', appId],
    ['status', 'active'],
    ['role', target.role],
  ]) {
    if (source[field] !== expected) {
      blockers.push(
        blocker(
          'APP_AUTHORITY_DRIFT',
          `${path}.${field}`,
          `Stored ${field} does not match the fixed migration target.`
        )
      )
    }
  }
  if (source.ecosystem != null && source.ecosystem !== ECOSYSTEM_ID) {
    blockers.push(
      blocker(
        'LEGACY_APP_ECOSYSTEM_DRIFT',
        `${path}.ecosystem`,
        'Legacy ecosystem selector does not match the fixed stored authority.'
      )
    )
  }
  if (
    source.moderation_state != null &&
    String(source.moderation_state).trim() !== ''
  ) {
    blockers.push(
      blocker(
        'APP_MODERATION_REVIEW_REQUIRED',
        `${path}.moderation_state`,
        'Non-empty moderation state cannot be silently cleared.'
      )
    )
  }
  if (source.ban_reasons != null && nonEmptyLegacyValue(source.ban_reasons)) {
    blockers.push(
      blocker(
        'APP_BAN_REASONS_REVIEW_REQUIRED',
        `${path}.ban_reasons`,
        'Non-empty ban reasons cannot be silently cleared.'
      )
    )
  }
  const membershipAdmins = [...memberships]
    .filter(([, membership]) => membership.get('role') === 'admin')
    .map(([uid]) => uid)
  const legacyAdmins = Array.isArray(source.admin_ids)
    ? source.admin_ids.map((value) => String(value ?? '').trim()).filter(Boolean)
    : []
  if (
    source.admin_ids != null &&
    (!Array.isArray(source.admin_ids) ||
      stableJson([...new Set(legacyAdmins)].sort()) !==
        stableJson(membershipAdmins.sort()))
  ) {
    blockers.push(
      blocker(
        'LEGACY_APP_ADMIN_INDEX_DRIFT',
        `${path}.admin_ids`,
        'Legacy App admin_ids must match canonical admin memberships before removal.'
      )
    )
  }
  if (
    source.team != null &&
    nonEmptyLegacyValue(source.team) &&
    source.team !== 'fireux'
  ) {
    const teamIds = Array.isArray(source.team)
      ? source.team.map((value) => String(value ?? '').trim()).filter(Boolean)
      : []
    const membershipIds = [...memberships.keys()]
    if (
      !Array.isArray(source.team) ||
      teamIds.length !== source.team.length ||
      teamIds.some((uid) => !membershipIds.includes(uid))
    ) {
      blockers.push(
        blocker(
          'LEGACY_APP_TEAM_REVIEW_REQUIRED',
          `${path}.team`,
          'Legacy App team must be a membership-backed uid list before removal.'
        )
      )
    }
  }
  if (
    source.fireux_native != null &&
    typeof source.fireux_native !== 'boolean'
  ) {
    blockers.push(
      blocker(
        'APP_NATIVE_STATE_INVALID',
        `${path}.fireux_native`,
        'Existing fireux_native must be a boolean before migration.'
      )
    )
  }
  if (
    source.fireux_size != null &&
    !['big', 'small'].includes(source.fireux_size)
  ) {
    blockers.push(
      blocker(
        'APP_SIZE_INVALID',
        `${path}.fireux_size`,
        'Existing App size is not canonical.'
      )
    )
  }
  if (
    !source.derived ||
    typeof source.derived !== 'object' ||
    Array.isArray(source.derived) ||
    stableJson(Object.keys(source.derived).sort()) !==
      stableJson(['user_count']) ||
    !Number.isInteger(source.derived.user_count) ||
    source.derived.user_count < 0
  ) {
    blockers.push(
      blocker(
        'APP_DERIVED_STATE_INVALID',
        `${path}.derived`,
        'Existing App derived state is not a canonical user_count map.'
      )
    )
  }
  const created = canonicalCreatedStamp(
    snapshot.get('created'),
    `${path}.created`,
    blockers
  )
  const updated = canonicalUpdatedStamp(
    snapshot.get('updated'),
    `${path}.updated`,
    blockers
  )
  if (!created || !updated) return null

  const payload = {
    project_id: ECOSYSTEM_ID,
    ecosystem_id: ECOSYSTEM_ID,
    database_id: DATABASE_ID,
    slug: appId,
    status: 'active',
    app_name: target.appName,
    app_short_name: target.appShortName,
    role: target.role,
    derived: { user_count: memberCount },
    fireux_native: true,
    fireux_size: snapshot.get('fireux_size') === 'big' ? 'big' : 'small',
    fireux_repo: clone(target.repo),
    self_join_enabled: target.selfJoinEnabled,
    moderation_state: '',
    ban_reasons: [],
    created,
    updated,
  }

  for (const [field, max] of [
    ['tagline', 120],
    ['description', 500],
    ['short_bio', 240],
    ['long_bio', 4000],
  ]) {
    const value = snapshot.get(field)
    if (typeof value === 'string' && value.trim()) {
      if (value.trim().length > max) {
        blockers.push(blocker('APP_TEXT_TOO_LONG', `${path}.${field}`, `Value exceeds ${max} characters.`))
      } else {
        payload[field] = value.trim()
      }
    }
  }

  const socialLinks = exactStringMap(snapshot.get('social_links'), [
    'website',
    'twitter',
    'github',
    'linkedin',
    'instagram',
    'facebook',
    'youtube',
    'email',
  ])
  if (source.social_links != null && !socialLinks) {
    blockers.push(
      blocker(
        'APP_SOCIAL_LINKS_INVALID',
        `${path}.social_links`,
        'Existing App social_links must be a string map.'
      )
    )
  }
  if (socialLinks) {
    for (const [key, value] of Object.entries(socialLinks)) {
      if (!value) continue
      if (key === 'email') {
        if (!normalizeEmail(value)) {
          blockers.push(
            blocker(
              'APP_SOCIAL_EMAIL_INVALID',
              `${path}.social_links.email`,
              'App social email must be empty or valid.'
            )
          )
        }
      } else if (!isHttpsUrl(value)) {
        blockers.push(
          blocker(
            'APP_SOCIAL_URL_INVALID',
            `${path}.social_links.${key}`,
            'App social links must be empty or HTTPS.'
          )
        )
      }
    }
    payload.social_links = socialLinks
  }
  const media = exactStringMap(snapshot.get('media'), [
    'thumbnail_url',
    'logo_url',
    'wordmark_light_url',
    'wordmark_dark_url',
    'cover_url',
  ])
  if (source.media != null && !media) {
    blockers.push(
      blocker(
        'APP_MEDIA_INVALID',
        `${path}.media`,
        'Existing App media must be a string map.'
      )
    )
  }
  if (media) {
    for (const [key, value] of Object.entries(media)) {
      if (value && !isHttpsUrl(value)) {
        blockers.push(
          blocker(
            'APP_MEDIA_URL_INVALID',
            `${path}.media.${key}`,
            'App media URLs must be empty or HTTPS.'
          )
        )
      }
    }
    payload.media = media
  }
  return payload
}

function canonicalPrivatePayload({
  snapshot,
  authEmail,
  uid,
  fallbackCreated,
  fallbackUpdated,
  blockers,
}) {
  if (!snapshot?.exists) {
    return {
      email: authEmail,
      preferences: {
        language: 'en',
        theme: 'system',
        email_security_alerts: true,
        share_usage_analytics: false,
      },
      terms: { version: '', accepted_at: null },
      created: fallbackCreated,
      updated: fallbackUpdated,
    }
  }

  const path = snapshot.ref.path
  const source = snapshot.data()
  const keys = Object.keys(source).sort()
  const expectedKeys = ['created', 'email', 'preferences', 'terms', 'updated']
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    blockers.push(
      blocker(
        'USER_PRIVATE_SCHEMA_INVALID',
        path,
        'Existing private account has unexpected fields and requires review.'
      )
    )
    return null
  }
  if (normalizeEmail(source.email) !== authEmail) {
    blockers.push(
      blocker(
        'USER_PRIVATE_AUTH_EMAIL_DRIFT',
        path,
        'Existing private email must match Firebase Auth.'
      )
    )
  }

  const preferences = source.preferences
  const preferenceKeys = [
    'email_security_alerts',
    'language',
    'share_usage_analytics',
    'theme',
  ]
  if (
    !preferences ||
    typeof preferences !== 'object' ||
    Array.isArray(preferences) ||
    JSON.stringify(Object.keys(preferences).sort()) !==
      JSON.stringify(preferenceKeys) ||
    typeof preferences.language !== 'string' ||
    preferences.language.length < 2 ||
    preferences.language.length > 16 ||
    !['system', 'light', 'dark'].includes(preferences.theme) ||
    typeof preferences.email_security_alerts !== 'boolean' ||
    typeof preferences.share_usage_analytics !== 'boolean'
  ) {
    blockers.push(
      blocker(
        'USER_PRIVATE_PREFERENCES_INVALID',
        `${path}.preferences`,
        'Existing preferences are not canonical and must not be overwritten implicitly.'
      )
    )
    return null
  }

  const terms = source.terms
  if (
    !terms ||
    typeof terms !== 'object' ||
    Array.isArray(terms) ||
    JSON.stringify(Object.keys(terms).sort()) !==
      JSON.stringify(['accepted_at', 'version']) ||
    typeof terms.version !== 'string' ||
    terms.version.length > 64 ||
    (terms.version && !(terms.accepted_at instanceof Timestamp)) ||
    (!terms.version && terms.accepted_at !== null)
  ) {
    blockers.push(
      blocker(
        'USER_PRIVATE_TERMS_INVALID',
        `${path}.terms`,
        'Existing consent evidence is not canonical and must not be guessed.'
      )
    )
    return null
  }

  const created = canonicalCreatedStamp(
    source.created,
    `${path}.created`,
    blockers
  )
  const updated = canonicalUpdatedStamp(
    source.updated,
    `${path}.updated`,
    blockers
  )
  if (!created || !updated) return null
  return {
    email: authEmail,
    preferences: {
      language: preferences.language,
      theme: preferences.theme,
      email_security_alerts: preferences.email_security_alerts,
      share_usage_analytics: preferences.share_usage_analytics,
    },
    terms: {
      version: terms.version,
      accepted_at: terms.accepted_at,
    },
    created,
    updated,
  }
}

function exactStringMap(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const allowed = new Set(keys)
  if (
    Object.keys(value).some((key) => !allowed.has(key)) ||
    Object.values(value).some((entry) => typeof entry !== 'string')
  ) {
    return null
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, entry.trim()])
  )
}

function canonicalCreatedStamp(value, valuePath, blockers, options = {}) {
  const stamp = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const at = stamp.at instanceof Timestamp ? stamp.at : null
  if (!at) {
    blockers.push(blocker('INVALID_CREATED_STAMP', valuePath, 'A real source timestamp is required.'))
    return null
  }
  const result = { at }
  const by = typeof stamp.by === 'string' ? stamp.by.trim() : ''
  if (by) result.by = by
  if (
    options.requiredAppId &&
    typeof stamp.app_id === 'string' &&
    stamp.app_id.trim() &&
    stamp.app_id.trim() !== options.requiredAppId
  ) {
    blockers.push(
      blocker(
        'CREATED_APP_SCOPE_DRIFT',
        valuePath,
        'Existing created.app_id conflicts with the fixed App scope.'
      )
    )
  }
  if (options.requiredAppId) result.app_id = options.requiredAppId
  else if (typeof stamp.app_id === 'string' && stamp.app_id.trim()) {
    result.app_id = stamp.app_id.trim()
  }
  return result
}

function canonicalUpdatedStamp(value, valuePath, blockers) {
  const stamp = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const at = stamp.at instanceof Timestamp ? stamp.at : null
  if (!(at instanceof Timestamp)) {
    blockers.push(blocker('INVALID_UPDATED_STAMP', valuePath, 'A real source timestamp is required.'))
    return null
  }
  const result = { at }
  const by = typeof stamp.by === 'string' ? stamp.by.trim() : ''
  if (by) result.by = by
  return result
}

function boundedRequiredString(value, max, valuePath, blockers) {
  const text = String(value ?? '').trim()
  if (!text || text.length > max) {
    blockers.push(blocker('INVALID_REQUIRED_TEXT', valuePath, `Expected 1-${max} characters.`))
    return ''
  }
  return text
}

function boundedOptionalString(value, max, valuePath, blockers) {
  if (value == null) return ''
  if (typeof value !== 'string') {
    blockers.push(
      blocker(
        'INVALID_OPTIONAL_TEXT',
        valuePath,
        `Expected a string of at most ${max} characters.`
      )
    )
    return ''
  }

  const text = value.trim()
  if (text.length > max) {
    blockers.push(
      blocker(
        'INVALID_OPTIONAL_TEXT',
        valuePath,
        `Expected a string of at most ${max} characters.`
      )
    )
    return ''
  }
  return text
}

function canonicalHandle(value, ownerPath, blockers) {
  const raw = String(value ?? '').trim()
  const normalized = raw.toLowerCase()
  if (raw !== normalized || !/^[a-z0-9][a-z0-9-]{2,29}$/.test(normalized)) {
    blockers.push(blocker('USER_HANDLE_NOT_CANONICAL', ownerPath, 'Handle must be lowercase, unique, and 3-30 URL-safe characters.'))
    return ''
  }
  return normalized
}

function canonicalAvatar(value, valuePath, blockers) {
  const avatar = String(value ?? '').trim()
  if (!avatar) return '/img/ecosystem/avatar.png'
  if (avatar === '/img/ecosystem/avatar.png' || isHttpsUrl(avatar)) return avatar
  blockers.push(
    blocker(
      'USER_AVATAR_INVALID',
      valuePath,
      'Existing avatar must be canonical default or a valid HTTPS URL.'
    )
  )
  return avatar
}

function isHttpsUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

function normalizeEmail(value) {
  const email = String(value ?? '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function replaceOperation(snapshot, payload, family, blockers) {
  const removedFields = Object.keys(snapshot.data())
    .filter((field) => !Object.prototype.hasOwnProperty.call(payload, field))
    .sort()
  const allowed = ALLOWED_REMOVED_FIELDS[family] ?? new Set()
  const unreviewed = removedFields.filter((field) => !allowed.has(field))
  const changedFields = Object.keys(payload)
    .filter(
      (field) =>
        !Object.prototype.hasOwnProperty.call(snapshot.data(), field) ||
        stableJson(normalizeForHash(snapshot.get(field))) !==
          stableJson(normalizeForHash(payload[field]))
    )
    .sort()
  if (unreviewed.length) {
    blockers.push(
      blocker(
        'UNREVIEWED_FIELD_REMOVAL',
        snapshot.ref.path,
        `Full replacement would remove unreviewed fields: ${unreviewed.join(', ')}.`
      )
    )
  }
  return {
    phase: phaseFor(family),
    family,
    action: 'replace',
    path: snapshot.ref.path,
    precondition: snapshotPrecondition(snapshot),
    changedFields,
    removedFields,
    payload,
  }
}

function upsertOperation(snapshot, targetPath, payload, family) {
  const exists = snapshot?.exists === true
  return {
    phase: phaseFor(family),
    family,
    action: exists ? 'replace' : 'create',
    path: targetPath,
    precondition: exists ? snapshotPrecondition(snapshot) : { exists: false },
    payload,
  }
}

function snapshotPrecondition(snapshot) {
  return {
    exists: true,
    updateTime: timestampToken(snapshot.updateTime),
  }
}

function phaseFor(family) {
  if (family === 'canonical-app') return 'authority'
  if (family === 'migration-marker') return 'markers'
  if (family.includes('membership') || family.includes('app-')) return 'membership'
  return 'identity'
}

function compareOperations(left, right) {
  const phases = { authority: 1, identity: 2, membership: 3, markers: 4 }
  return (
    (phases[left.phase] ?? 99) - (phases[right.phase] ?? 99) ||
    left.path.localeCompare(right.path)
  )
}

function hashableOperation(operation) {
  return {
    ...operation,
    payload: normalizeForHash(operation.payload),
  }
}

function normalizeForHash(value) {
  if (value instanceof Timestamp) {
    return { __timestamp: timestampToken(value) }
  }
  if (Array.isArray(value)) return value.map(normalizeForHash)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => [key, normalizeForHash(entry)])
  )
}

function timestampToken(value) {
  return value instanceof Timestamp
    ? { seconds: value.seconds, nanoseconds: value.nanoseconds }
    : null
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (!value || typeof value !== 'object') return JSON.stringify(value)
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
    .join(',')}}`
}

function countOperations(operations) {
  const result = { creates: 0, replacements: 0, totalOperations: 0 }
  for (const operation of operations) {
    if (operation.action === 'create') result.creates += 1
    if (operation.action === 'replace') result.replacements += 1
    result.totalOperations += 1
  }
  return result
}

function blocker(code, subjectPath, message) {
  return { code, subjectPathSha256: sha256(subjectPath), message }
}

function serverValue(kind) {
  return { __operation: kind }
}

function clone(value) {
  return structuredClone(value)
}

function sha256(value) {
  return createHash('sha256')
    .update(JSON.stringify(normalizeForHash(value)))
    .digest('hex')
}

function summarize(plan) {
  return {
    format: plan.format,
    mode: plan.mode,
    readOnly: plan.readOnly,
    target: plan.target,
    inspectedAt: plan.inspectedAt,
    counts: plan.counts,
    safety: {
      status: plan.safety.status,
      blockerCount: plan.safety.blockers.length,
      warningCount: plan.safety.warnings.length,
      blockerCodes: [...new Set(plan.safety.blockers.map((entry) => entry.code))].sort(),
      warningCodes: [...new Set(plan.safety.warnings.map((entry) => entry.code))].sort(),
    },
    operationSetSha256: plan.operationSetSha256,
    finalPlanSha256: plan.finalPlanSha256,
    artifactSha256: plan.artifactSha256,
    applyBoundary: plan.applyBoundary,
  }
}
