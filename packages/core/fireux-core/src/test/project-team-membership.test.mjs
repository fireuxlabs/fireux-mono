import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const source = readFileSync(new URL('../../../../../projects/fireux/fireux-app/server/project/core/authority.ts', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')

test('Project tools need the account Project association, independent of Team status', async () => {
  let member = { user_id: 'u', status: 'active' }
  let membership = { projects: ['p'], role: 'user' }
  const doc = path => ({
    collection: name => ({ doc: id => doc(`${path}/${name}/${id}`) }),
    get: async () => ({ exists: true, data: () => path.endsWith('/team/u') ? member : path.endsWith('/users/u') ? membership : {} }),
  })
  const db = { collection: name => ({ doc: id => doc(`${name}/${id}`) }) }
  const run = compileFunction(`${stripTypeScriptTypes(source)}; return requireProjectOperator`, [
    'useRuntimeConfig', 'requireFirebaseBearerUser', 'requireFirestoreDocumentId', 'requireWorkspaceEntityMemberRole', 'createError', 'getFirestoreDb',
  ])(() => ({ public: { fireux: { id: 'app' } } }), async () => ({ uid: 'u' }), x => x, () => {}, x => Object.assign(new Error(x.statusMessage), x), async () => db)
  await run({}, 'p')
  member = { ...member, role: 'member' }
  await run({}, 'p')
  member = { ...member, status: 'inactive' }
  await run({}, 'p')
  member = { ...member, status: 'active', user_id: 'other' }
  await run({}, 'p')
  member = { ...member, user_id: 'u' }
  membership = { ...membership, projects: ['elsewhere'] }
  await assert.rejects(run({}, 'p'), { statusCode: 403 })
})
