import { resolveAppUserAccess } from '../../../../core/fireux-core/src/runtime/app/app-user/utils/access.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

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
const { readMembershipAccessIds } = load(
  '../../../../core/fireux-core/src/runtime/app/app-user/utils/membership-access.ts',
  {},
  '({readMembershipAccessIds})'
)
const created = { seconds: 100, nanoseconds: 500 }

function harness() {
  const state = {
    member: { user_id: 'u', status: 'active' },
    membership: {
      role: 'user',
      subscription: 'free',
      created: { at: created },
    },
    access: { ids: ['p'], membership_created_at: created },
    memberExists: true,
  }
  const reads = []
  const doc = (path) => ({
    collection: (name) => ({ doc: (id) => doc(`${path}/${name}/${id}`) }),
    get: async () => {
      reads.push(path)
      const membership = path === 'apps/app/users/u'
      return {
        exists: membership ? state.memberExists : true,
        data: () =>
          membership
            ? state.membership
            : path === 'project_access/app/users/u'
              ? state.access
              : path.endsWith('/team/u')
                ? state.member
                : {},
      }
    },
  })
  const db = { collection: (name) => ({ doc: (id) => doc(`${name}/${id}`) }) }
  const run = load(
    '../runtime/project/server/authority.ts',
    {
      useFireUXConfig: () => ({ appId: 'app' }),
      requireFirebaseBearerUser: async () => ({ uid: 'u' }),
      requireFirestoreDocumentId: (x) => x,
      resolveAppUserAccess,
      createError,
      getRuntimeFirestore: (id) => {
        assert.equal(id, 'fireux')
        return db
      },
      serverProjectAccessTarget: () => ({
        collectionPath: 'project_access/app/users',
      }),
      readMembershipAccessIds,
    },
    'requireProjectOperator'
  )
  return { state, reads, run }
}

test('Project tools use Project access independently of Team and retired AppUser fields', async () => {
  const h = harness()
  await h.run({}, 'p')
  h.state.member = { user_id: 'other', status: 'inactive', role: 'member' }
  await h.run({}, 'p')
  assert.equal(
    h.reads.some((path) => path.includes('/team/')),
    false
  )
  h.state.access.ids = ['elsewhere']
  h.state.membership.projects = ['p']
  await assert.rejects(h.run({}, 'p'), { statusCode: 403 })
})

test('Removing or recreating App membership revokes retained Project access', async () => {
  const h = harness()
  h.state.memberExists = false
  await assert.rejects(h.run({}, 'p'), { statusCode: 403 })
  h.state.memberExists = true
  h.state.membership.created.at = {
    ...created,
    nanoseconds: created.nanoseconds + 1,
  }
  await assert.rejects(h.run({}, 'p'), { statusCode: 403 })
  h.state.access.membership_created_at = h.state.membership.created.at
  await h.run({}, 'p')
})

test('Project operator preflight denies invalid subscriptions and roles despite a current grant', async () => {
  for (const change of [
    ...[undefined, null, '', 'unknown', {}, [], 1].map((subscription) => ({
      subscription,
    })),
    ...[undefined, null, 'guest', ' user ', {}, []].map((role) => ({ role })),
  ]) {
    const h = harness()
    Object.assign(h.state.membership, change)
    await assert.rejects(h.run({}, 'p'), { statusCode: 403 })
  }
})

test('Project operator preflight preserves canonical and legacy valid memberships', async () => {
  for (const role of ['user', 'admin', 'dev']) {
    for (const subscription of ['free', 'pro', 'business', 'premium']) {
      const h = harness()
      Object.assign(h.state.membership, { role, subscription })
      const actor = await h.run({}, 'p')
      assert.equal(actor.uid, 'u')
      assert.equal(actor.appId, 'app')
      assert.equal(actor.projectId, 'p')
      assert.deepEqual(actor.membership, h.state.membership)
    }
  }
})

test('Malformed Project access fails closed instead of borrowing Team or AppUser rights', async () => {
  const h = harness()
  h.state.access.ids = ['p', 'p']
  await assert.rejects(h.run({}, 'p'), { statusCode: 409 })
  h.state.access = undefined
  await assert.rejects(h.run({}, 'p'), { statusCode: 403 })
  h.state.membership.created = undefined
  await assert.rejects(h.run({}, 'p'), { statusCode: 409 })
})
