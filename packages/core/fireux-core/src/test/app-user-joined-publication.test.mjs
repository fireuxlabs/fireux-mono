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
