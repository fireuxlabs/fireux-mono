import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(new URL('../runtime/app/server/events/publish-user-joined.ts', import.meta.url), 'utf8').replace(/^import.*\n/gm, '').replace(/^export /gm, '')
function publisher(env, outcome='delivered', ok=true) {
 const calls=[]
 class GoogleAuth {
  async getIdTokenClient(audience) {
   calls.push(['client', audience])
   return { idTokenProvider: { async fetchIdToken(aud) { calls.push(['token', aud]); return 'oidc-token' } } }
  }
 }

 const run=compileFunction(`${stripTypeScriptTypes(source)};return publishAppUserJoinedPublication`,['process','GoogleAuth','fetch','AbortSignal'])({env},GoogleAuth,async(url,request)=>{calls.push(['request',url,request]);return {ok,status:503,json:async()=>({outcome})}},AbortSignal)
 return {run,calls}
}
const body={version:1,event_id:'joined-user',source:{firebase_project_id:'host',database_id:'main',project_id:'project',ecosystem_id:'ecosystem',app_id:'app'},user_id:'user',membership_role:'user',occurred_at:'2026-10-01T12:00:00Z'}
test('Absent target disables transport without credentials or network',async()=>{const x=publisher({});assert.equal(await x.run(body),'disabled');assert.deepEqual(x.calls,[])})
test('Configured transport preserves wire payload, OIDC audience and duplicate outcome',async()=>{const x=publisher({FIREUX_SIGNUP_MONITOR_ENDPOINT:'https://receiver.example/events',FIREUX_SIGNUP_MONITOR_OIDC_AUDIENCE:'https://receiver.example'},'duplicate');assert.equal(await x.run(body),'duplicate');assert.equal(x.calls[0][1],'https://receiver.example/');const req=x.calls[2];assert.equal(req[1],'https://receiver.example/events');assert.equal(req[2].headers.authorization,'Bearer oidc-token');assert.deepEqual(JSON.parse(req[2].body),body)})
test('Invalid target and receiver failure remain explicit',async()=>{const bad=publisher({FIREUX_SIGNUP_MONITOR_ENDPOINT:'http://receiver.example/events',FIREUX_SIGNUP_MONITOR_OIDC_AUDIENCE:'https://receiver.example'});await assert.rejects(bad.run(body),/misconfigured/);assert.deepEqual(bad.calls,[]);const failed=publisher({FIREUX_SIGNUP_MONITOR_ENDPOINT:'https://receiver.example/events',FIREUX_SIGNUP_MONITOR_OIDC_AUDIENCE:'https://receiver.example'},'',false);await assert.rejects(failed.run(body),/503/)})

test('ordinary App signup records its local event and supplies Project scope only for portal delivery', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/server/api/internal/events/user-joined.post.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import.*\n/gm, '')
    .replace('export default', 'const handle =')
  const fireux = { id: 'app', ecosystemId: 'ecosystem' }
  const events = []
  const publications = []
  const dependencies = {
    defineEventHandler: (handler) => handler,
    requireFirebaseBearerUser: async () => ({ uid: 'user' }),
    useRuntimeConfig: () => ({
      public: {
        fireux,
        firebaseEcosystem: {
          firebase: { projectId: 'host', databaseId: 'main' },
        },
      },
    }),
    publishAppUserJoinedEvent: async (input) => {
      events.push(input)
      return {
        eventId: 'joined-user',
        occurredAt: '2026-10-01T12:00:00Z',
        membershipRole: 'user',
        created: events.length === 1,
      }
    },
    publishAppUserJoinedPublication: async (publication) => {
      publications.push(publication)
      return 'delivered'
    },
  }
  const handler = compileFunction(
    `${stripTypeScriptTypes(source)}; return handle`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const ordinary = await handler({})
  assert.equal(ordinary.event.created, true)
  assert.equal(ordinary.monitor, 'disabled')
  assert.deepEqual(events, [
    { appId: 'app', ecosystemId: 'ecosystem', userId: 'user' },
  ])
  assert.deepEqual(publications, [])

  fireux.projectId = 'project'
  assert.equal((await handler({})).monitor, 'delivered')
  assert.deepEqual(publications, [body])
})
