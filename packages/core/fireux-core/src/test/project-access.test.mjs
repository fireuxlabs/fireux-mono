import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref, toValue, isRef } from 'vue'

function load(path, bindings, result) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const stamps = { seconds: 123, nanoseconds: 456 }
const membership = () => ({
  role: 'user',
  subscription: 'free',
  created: { at: { ...stamps } },
})
const contract = load(
  '../runtime/app/utils/membership-access.ts',
  {},
  '({ readMembershipAccessIds, membershipCreatedAt })'
)
const projectAccessCollectionPath = load(
  '../runtime/project/utils/project-access.ts',
  {},
  'projectAccessCollectionPath'
)
const { serverProjectAccessTarget } = load(
  '../runtime/project/server/access.ts',
  {
    createError,
    ...contract,
    projectAccessCollectionPath,
    defineFirestoreMutationTarget: (value) => value,
  },
  '({ serverProjectAccessTarget })'
)

function liveHarness() {
  const session = {
    uid: ref('u'),
    app: ref({ id: 'app' }),
    appUser: ref(membership()),
    pending: ref(false),
    error: ref(null),
  }
  const document = Object.assign(
    ref({ ids: ['p'], membership_created_at: { ...stamps } }),
    { pending: ref(false), error: ref(null), outcome: ref('ready') }
  )
  const roots = Object.assign(ref([{ id: 'p', name: 'Project' }]), {
    error: ref(null),
    outcome: ref('ready'),
  })
  let boundPath, boundId
  const useMembershipAccess = load(
    '../runtime/app/composables/useMembershipAccess.ts',
    {
      computed,
      toValue,
      ...contract,
      useFirestoreRead: () => ({
        firestoreFetchDoc: (path, id) => {
          boundPath = path
          boundId = id
          return document
        },
      }),
    },
    'useMembershipAccess'
  )
  const useProjectAccess = load(
    '../runtime/project/composables/useProjectAccess.ts',
    {
      computed,
      useMembershipAccess,
      projectAccessCollectionPath,
      useAppSession: () => session,
      useFireUXConfig: () => ({ appId: 'app' }),
    },
    'useProjectAccess'
  )
  const useProjectCollection = load(
    '../runtime/project/composables/useProjectCollection.ts',
    {
      computed,
      isRef,
      useProjectAccess,
      useFirestoreResolver: () => () => ({}),
      useFirestoreRead: () => ({ firestoreQuery: () => roots }),
      collection: (_db, path) => path,
      documentId: () => 'id',
      where: (...args) => args,
      query: (...args) => args,
    },
    'useProjectCollection'
  )
  const collection = useProjectCollection()
  return { session, document, roots, collection, boundPath, boundId }
}

test('Project collection reacts to domain grants and clears revoked roots immediately', () => {
  const h = liveHarness()
  assert.equal(h.boundPath.value, 'project_access/app/users')
  assert.equal(h.boundId.value, 'u')
  assert.deepEqual(
    h.collection.projects.value.map((x) => x.id),
    ['p']
  )
  h.document.value = { ids: [], membership_created_at: stamps }
  assert.deepEqual(h.collection.projects.value, [])
  assert.equal(h.collection.access.outcome.value, 'empty')
  assert.equal(
    h.roots.value.length,
    1,
    'old query results cannot retain a revoked Project'
  )
  h.document.value = { ids: ['p'], membership_created_at: stamps }
  assert.equal(h.collection.projects.value.length, 1)
  h.session.appUser.value.created.at = {
    ...stamps,
    nanoseconds: stamps.nanoseconds + 1,
  }
  assert.equal(h.collection.projects.value.length, 0)
  h.session.appUser.value = null
  assert.equal(h.boundId.value, null)
  assert.equal(h.collection.access.outcome.value, 'idle')
})

test('Access pending, malformed records, and read failures never appear as a usable empty allowance', () => {
  const h = liveHarness()
  h.document.pending.value = true
  assert.equal(h.collection.access.outcome.value, 'pending')
  assert.equal(h.collection.projects.value.length, 0)
  h.document.pending.value = false
  h.document.value = { ids: ['p', 'p'], membership_created_at: stamps }
  assert.equal(h.collection.access.outcome.value, 'error')
  assert.equal(h.collection.outcome.value, 'error')
  h.document.value = { ids: ['p'], membership_created_at: stamps }
  assert.equal(h.collection.outcome.value, 'ready')
  h.document.error.value = new Error('Denied')
  assert.equal(h.collection.access.outcome.value, 'error')
  assert.equal(h.collection.projects.value.length, 0)
  h.document.error.value = null
  h.session.error.value = new Error('Membership failed')
  assert.equal(h.collection.projects.value.length, 0)
  assert.equal(h.collection.access.outcome.value, 'error')
})

function createHarness(access) {
  const state = { membership: membership(), access, reads: [], writes: [] }
  const appTarget = { collectionPath: 'apps' }
  const projectsTarget = { collectionPath: 'projects' }
  const transaction = {
    read: async (target, id) => {
      assert.equal(state.writes.length, 0, 'all authority reads precede writes')
      state.reads.push(`${target.collectionPath}/${id}`)
      const data =
        target.collectionPath === 'apps/app/users'
          ? state.membership
          : target.collectionPath === 'project_access/app/users'
            ? state.access
            : {}
      return { exists: data != null, data }
    },
    create: (target, id, data) =>
      state.writes.push({
        verb: 'create',
        path: `${target.collectionPath}/${id}`,
        data,
      }),
    update: (target, id, data) =>
      state.writes.push({
        verb: 'update',
        path: `${target.collectionPath}/${id}`,
        data,
      }),
  }
  const db = {
    collection: (path) => ({
      doc: () => ({
        id: 'new',
        get: async () => ({ data: () => ({ display_name: 'User' }) }),
      }),
    }),
  }
  const { hasAppSubscriptionCapacity } = load(
    '../runtime/app/utils/app-subscription-capacity.ts',
    {},
    '({hasAppSubscriptionCapacity})'
  )
  const createProject = load(
    '../../../../../projects/fireux/fireux-app/server/project/index/create.ts',
    {
      createError,
      serverProjectAccessTarget,
      readMembershipAccessIds: contract.readMembershipAccessIds,
      ...contract,
      useFireUXConfig: () => ({
        appId: 'app',
        subscriptionCapacity: { project: { free: 1, premium: null } },
      }),
      requireFirebaseBearerUser: async () => ({ uid: 'u' }),
      runGuardedServerTransaction: async (database, run) => {
        assert.equal(database.databaseId, 'fireux')
        return run(transaction)
      },
      requireFirestoreDocumentId: (x) => x,
      serverAuditStamp: (value) => ({ at: stamps, ...value }),
      resolveWorkspaceEntityCreationId: () => 'first',
      requireWorkspaceEntityMemberRole: ({ exists, role }) => {
        if (!exists || !['user', 'admin', 'dev'].includes(role))
          throw createError({ statusCode: 403 })
      },
      isAppUserSubscription: (value) =>
        ['free', 'premium', 'business'].includes(value),
      hasAppSubscriptionCapacity,
      FIRESTORE_MUTATION_TARGETS: {
        fireuxApps: appTarget,
        fireuxProjects: projectsTarget,
      },
      fireuxAppUsersTarget: () => ({ collectionPath: 'apps/app/users' }),
      fireuxProjectTeamMembersTarget: (id) => ({
        collectionPath: `projects/${id}/team`,
      }),
      getFirestoreDb: async (id) => {
        assert.equal(id, 'fireux')
        return db
      },
    },
    'createProject'
  )
  return { state, run: () => createProject({}, { name: 'Example' }) }
}

test('Project creation writes Project, Team, and lifetime-bound access together without mutating AppUser', async () => {
  const h = createHarness(undefined)
  await h.run()
  assert.ok(h.state.reads.includes('project_access/app/users/u'))
  assert.deepEqual(
    h.state.writes.map((x) => x.path),
    ['projects/first', 'projects/first/team/u', 'project_access/app/users/u']
  )
  assert.deepEqual(h.state.writes.at(-1).data, {
    ids: ['first'],
    membership_created_at: stamps,
  })
  assert.deepEqual(h.state.membership, membership())
})

test('Project creation counts all access ids, including missing roots, and rejects malformed authority', async () => {
  const h = createHarness({
    ids: ['missing-root'],
    membership_created_at: stamps,
  })
  await assert.rejects(h.run(), { statusCode: 403 })
  assert.equal(h.state.writes.length, 0)
  h.state.access.ids = ['bad/id']
  await assert.rejects(h.run(), { statusCode: 409 })
  assert.equal(h.state.writes.length, 0)
  h.state.access = undefined
  h.state.membership.role = 'unknown'
  await assert.rejects(h.run(), { statusCode: 403 })
  assert.equal(h.state.writes.length, 0)
})

test('Creation after rejoining replaces stale grants and preserves current grants for additional Projects', async () => {
  const h = createHarness({
    ids: ['old'],
    membership_created_at: { ...stamps, seconds: 1 },
  })
  await h.run()
  assert.deepEqual(h.state.writes.at(-1), {
    verb: 'update',
    path: 'project_access/app/users/u',
    data: { ids: ['first'], membership_created_at: stamps },
  })
  const premium = createHarness({
    ids: ['existing'],
    membership_created_at: stamps,
  })
  premium.state.membership.subscription = 'premium'
  await premium.run()
  assert.deepEqual(premium.state.writes.at(-1).data.ids, ['existing', 'new'])
})

test('Project server projection observes domain access and returns allowed ids even when roots are missing', async () => {
  const state = {
    access: { ids: ['p', 'missing'], membership_created_at: stamps },
  }
  const reads = []
  const record = {
    status: 'active',
    name: 'Project',
    description: '',
    image_url: '',
    created: { at: stamps },
    updated: { at: stamps },
  }
  const doc = (path) => ({
    id: path.split('/').at(-1),
    path,
    collection: (name) => ({ doc: (id) => doc(`${path}/${name}/${id}`) }),
    get: async () => {
      reads.push(path)
      return {
        exists: true,
        data: () =>
          path === 'apps/app/users/u'
            ? membership()
            : path === 'project_access/app/users/u'
              ? state.access
              : {},
      }
    },
  })
  const db = {
    collection: (path) => ({ doc: (id) => doc(`${path}/${id}`) }),
    getAll: async (...refs) =>
      refs.map(({ id }) => ({ id, exists: id === 'p', data: () => record })),
  }
  const readProjectDocument = load(
    '../runtime/project/utils/readProject.ts',
    {},
    'readProjectDocument'
  )
  const read = load(
    '../../../../../projects/fireux/fireux-app/server/project/index/read.ts',
    {
      useRuntimeConfig: () => ({ public: { fireux: { id: 'app' } } }),
      createError,
      readProjectDocument,
      requireFirebaseBearerUser: async () => ({ uid: 'u' }),
      requireWorkspaceEntityMemberRole: () => {},
      getFirestoreDb: async (id) => {
        assert.equal(id, 'fireux')
        return db
      },
      serverProjectAccessTarget,
      readMembershipAccessIds: contract.readMembershipAccessIds,
    },
    'readProjectIndex'
  )
  const initial = await read({})
  assert.deepEqual(initial.project_ids, ['p', 'missing'])
  assert.deepEqual(
    initial.items.map((x) => x.id),
    ['p']
  )
  assert.equal(Object.hasOwn(initial, 'primary_project'), false)
  assert.ok(reads.includes('project_access/app/users/u'))
  state.access.ids = []
  assert.deepEqual((await read({})).items, [])
  await assert.rejects(read({}, 'p'), { statusCode: 403 })
})
