import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {stripTypeScriptTypes} from 'node:module'
import {compileFunction} from 'node:vm'
import * as crypto from 'node:crypto'
function load(path,result,deps={}) {
 const source=readFileSync(new URL(path,import.meta.url),'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,'').replace(/^export /gm,'')
 return compileFunction(`${stripTypeScriptTypes(source,{mode:'transform'})};return ${result}`,Object.keys(deps))(...Object.values(deps))
}
const protocol=load('../runtime/user/server/connections/protocol.ts','{ConnectionError,signature,equalSecret}',crypto)
const transport=load('../runtime/user/server/connections/transport.ts','{peerBody,requireConnectionOrigin,connectionBoundary,callConnectionPeer}',{
 ...protocol,getHeader:(event,name)=>event.headers[name],readRawBody:async event=>event.raw,setResponseHeader:(event,name,value)=>event.response[name]=value,
 createError:props=>Object.assign(new Error(props.statusMessage),props),$fetch:async()=>{throw {statusCode:410,data:{statusMessage:'This sign-in has expired. Start again.'}}},
})
function signed(raw='{"action":"exchange"}',time=Date.now()) {
 const secret='server-only'.repeat(5),stamp=String(time)
 return {secret,event:{raw,headers:{'x-fireux-time':stamp,'x-fireux-proof':protocol.signature(secret,`${stamp}.${raw}`)},response:{}}}
}
test('server peer authentication verifies the exact body and protects response caching/referrers',async()=>{
 const h=signed();assert.deepEqual(await transport.peerBody(h.event,h.secret),{action:'exchange'})
 assert.deepEqual(h.event.response,{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'})
 h.event.raw='{"action":"prove","localUid":"attacker"}';await assert.rejects(transport.peerBody(h.event,h.secret),{statusCode:403})
})
test('missing, incorrect and expired peer credentials are rejected',async()=>{
 for(const change of [h=>delete h.event.headers['x-fireux-proof'],h=>h.secret='different'.repeat(5),h=>h.event.headers['x-fireux-time']='bad']) {
  const h=signed();change(h);await assert.rejects(transport.peerBody(h.event,h.secret),{statusCode:403})
 }
 const expired=signed(undefined,Date.now()-61000);await assert.rejects(transport.peerBody(expired.event,expired.secret),{statusCode:403})
})
test('oversized peer payload and correctly signed malformed JSON fail before use',async()=>{
 const huge=signed('x'.repeat(4097));await assert.rejects(transport.peerBody(huge.event,huge.secret),{statusCode:403})
 const broken=signed('not-json');await assert.rejects(transport.peerBody(broken.event,broken.secret),{statusCode:400})
})
test('browser mutation requires its exact approved origin',()=>{
 const event={headers:{origin:'https://fireux.app'},response:{}};transport.requireConnectionOrigin(event,'https://fireux.app')
 event.headers.origin='https://attacker.example';assert.throws(()=>transport.requireConnectionOrigin(event,'https://fireux.app'),{statusCode:403})
 delete event.headers.origin;assert.throws(()=>transport.requireConnectionOrigin(event,'https://fireux.app'),{statusCode:403})
})
test('credential/provider failures never cross the browser boundary as raw diagnostics',async()=>{
 await assert.rejects(transport.connectionBoundary(async()=>{throw new Error('private provider credential detail')}),failure=>failure.statusCode===503 && !failure.message.includes('private provider'))
 await assert.rejects(transport.callConnectionPeer('https://fireux.app','test-secret',{action:'exchange'}),{statusCode:410,message:'This sign-in has expired. Start again.'})
})
