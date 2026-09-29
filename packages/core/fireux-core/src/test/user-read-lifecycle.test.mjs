import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, isRef } from 'vue'
function load(path, name, dependencies) {
  const source = stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), 'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export /gm, ''))
  return compileFunction(`${source}; return ${name}`, Object.keys(dependencies))(...Object.values(dependencies))
}
test('Handle changes reuse one query binding and never resolve previous handle rows', () => {
  const rows = ref([{id:'a',handle:'alice'}]); rows.pending=ref(false); rows.error=ref(null)
  let calls=0, query
  const use = load('../runtime/user/composables/useUserByHandle.ts','useUserByHandle', {
    computed,isRef, collection:()=> 'users',where:(_field,_op,value)=>value,fslimit:n=>n,fsq:(...args)=>args,
    useFirestore:()=>({}),readRuntimeIdentityFirestoreDatabaseId:()=> 'identity',
    useFirestoreRead:()=>({firestoreQuery:q=>{calls++;query=q;return rows}}),
    normalizeUserHandle:value=>value.toLowerCase(),
    useUserRead:id=>({user:computed(()=>id.value ? {id:id.value}:null),pending:ref(false),error:ref(null)})
  })
  const handle=ref('alice'), state=use(handle)
  assert.equal(state.uid.value,'a')
  assert.equal(query.value[2],2)
  handle.value='bob'
  assert.equal(query.value[1],'bob')
  assert.equal(state.uid.value,null)
  rows.value=[{id:'b',handle:'bob'}]
  assert.equal(state.uid.value,'b')
  rows.value=[{id:'b',handle:'bob'},{id:'other',handle:'bob'}]
  assert.equal(state.uid.value,null)
  assert.equal(state.outcome.value,'error')
  assert.match(state.error.value.message,/not unique/)
  rows.value=[{id:'b',handle:'bob'}]
  assert.equal(state.outcome.value,'ready')
  handle.value=''
  assert.equal(query.value,null)
  assert.equal(calls,1)
  rows.error.value=new Error('Denied')
  assert.equal(state.missing.value,false)
})
test('Notifications hide previous owner data immediately on account change or logout', async () => {
  const currentUser=ref({uid:'a',getIdToken:async()=> 'token'}), data=ref(), error=ref(null)
  let execute
  const use=load('../runtime/user/composables/notifications/useUserNotifications.ts','useUserNotifications',{
    computed,useAuth:()=>({currentUser,hasAuthState:ref(true)}),
    useLiveAsyncData:(_key,handler)=>{execute=async()=>{data.value=await handler(async()=>({ok:true,notifications:[{id:'notice',read:false}]}))};return {data,error,pending:ref(false),refresh:()=>execute()}}
  })
  const state=use();await execute();assert.equal(state.unreadCount.value,1)
  currentUser.value={uid:'b',getIdToken:async()=> 'token'}
  assert.deepEqual(state.notifications.value,[])
  currentUser.value=null
  assert.deepEqual(state.notifications.value,[])
  assert.equal(state.outcome.value,'idle')
})

test('AppUser authority is withdrawn whenever the membership read is not ready', () => {
  const use = load('../runtime/app/composables/useAppUserAccess.ts', 'useAppUserAccess', {
    computed,
    resolveAppUserAccess: membership => ({
      hasAdminAuthority: Boolean(membership), hasDeveloperAuthority: Boolean(membership),
      subscription: membership?.subscription ?? 'free',
      hasPremiumSubscription: Boolean(membership), hasBusinessSubscription: Boolean(membership),
    }),
  })
  const appUser = ref({role:'admin',subscription:'business'})
  const appOutcome = ref('ready')
  const state = use({appUser,appOutcome})
  assert.equal(state.isAdmin.value,true)
  for (const outcome of ['pending','error','missing','idle']) {
    appOutcome.value=outcome
    assert.equal(state.isAdmin.value,false)
    assert.equal(state.canOwnMultipleWorkspaces.value,false)
  }
  appOutcome.value='ready'
  assert.equal(state.isAdmin.value,true)
  appUser.value=null
  assert.equal(state.isAdmin.value,false)
})

test('Public profiles require both matching snapshots before reading their data', () => {
  const mapEntry = load('../runtime/user/server/directory/profile-directory.ts', 'mapEntry', {
    readUserIdentitySummary: snapshot => snapshot.exists ? { id: snapshot.id } : null,
  })
  const config = { kind: 'chef', mapProfile: data => data }
  const user = { id: 'person', exists: true }
  const profile = {
    id: 'chef', exists: true,
    ref: { path: 'users/person/profiles/chef' },
    data: () => ({ title: 'Chef' }),
  }
  assert.equal(mapEntry(config, undefined, user, 'index'), null)
  assert.equal(mapEntry(config, { get ref() { throw new Error('Premature access') } }, undefined, 'detail'), null)
  assert.equal(mapEntry(config, profile, { id: 'other', exists: true }, 'index'), null)
  assert.deepEqual(mapEntry(config, profile, user, 'detail'), {
    id: 'person', kind: 'chef', profile: { title: 'Chef' }, user: { id: 'person' },
  })
})
