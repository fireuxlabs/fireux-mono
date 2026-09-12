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
  '../runtime/app/utils/membership-access.ts',
  {},
  '({readMembershipAccessIds})'
)
const created = { seconds: 100, nanoseconds: 500 }

function harness() {
  const state = {
    member: { user_id: 'u', status: 'active' },
    membership: { role: 'user', created: { at: created } },
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
    '../../../../../projects/fireux/fireux-app/server/project/core/authority.ts',
    {
      useRuntimeConfig: () => ({ public: { fireux: { id: 'app' } } }),
      requireFirebaseBearerUser: async () => ({ uid: 'u' }),
      requireFirestoreDocumentId: (x) => x,
      requireWorkspaceEntityMemberRole: ({ exists, role }) => {
        if (!exists || !['user', 'admin', 'dev'].includes(role))
          throw createError({ statusCode: 403 })
      },
      createError,
      getFirestoreDb: async (id) => {
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

test('Malformed Project access fails closed instead of borrowing Team or AppUser rights', async () => {
  const h = harness()
  h.state.access.ids = ['p', 'p']
  await assert.rejects(h.run({}, 'p'), { statusCode: 409 })
  h.state.access = undefined
  await assert.rejects(h.run({}, 'p'), { statusCode: 403 })
  h.state.membership.created = undefined
  await assert.rejects(h.run({}, 'p'), { statusCode: 409 })
})
