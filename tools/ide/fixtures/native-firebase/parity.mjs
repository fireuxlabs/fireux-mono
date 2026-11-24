import assert from 'node:assert/strict'
import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth'
import {
  connectFirestoreEmulator,
  doc,
  getDocFromServer,
  getFirestore,
  terminate,
} from 'firebase/firestore'
import { initializeApp as initializeAdmin } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import {
  getFirestore as getAdminFirestore,
  Timestamp,
} from 'firebase-admin/firestore'

const projectId = 'demo-native-foundation'
assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:18744')
assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST, '127.0.0.1:19099')
const app = initializeApp({ projectId, apiKey: 'demo-key' })
const admin = initializeAdmin({ projectId })
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://127.0.0.1:19099', { disableWarnings: true })
const ecosystem = getFirestore(app, 'probe')
const identity = getFirestore(app, 'identity')
for (const db of [ecosystem, identity])
  connectFirestoreEmulator(db, '127.0.0.1', 18744)

try {
  const credential = GoogleAuthProvider.credential(
    JSON.stringify({
      sub: 'fixture-google-user',
      email: 'fixture-google@example.test',
      email_verified: true,
    })
  )
  const { user } = await signInWithCredential(auth, credential)
  const adminAuth = getAdminAuth(admin)
  const token = await user.getIdToken()
  const claims = await adminAuth.verifyIdToken(token)
  assert.equal(claims.firebase.sign_in_provider, 'google.com')
  console.log('PASS Google credential through the native SDK and Auth emulator')

  const uid = user.uid
  const ecosystemAdmin = getAdminFirestore(admin, 'probe')
  const identityAdmin = getAdminFirestore(admin, 'identity')
  const timestamp = new Timestamp(100, 0)
  await identityAdmin.doc('users/' + uid).set({ name: 'Fixture User' })
  await ecosystemAdmin
    .doc('apps/probe/users/' + uid)
    .set({ created: { at: timestamp } })
  await ecosystemAdmin
    .doc('grants/' + uid)
    .set({ allowed: true, membership_created_at: timestamp })
  assert.equal(
    (await getDocFromServer(doc(identity, 'users', uid))).data().name,
    'Fixture User'
  )
  assert.equal(
    (await getDocFromServer(doc(ecosystem, 'kitchens', 'a'))).exists(),
    true
  )
  await assert.rejects(getDocFromServer(doc(ecosystem, 'users', uid)), {
    code: 'permission-denied',
  })
  console.log('PASS split identity and Ecosystem reads with isolated Rules')

  const canRead = async () => {
    const [membership, grant] = await Promise.all([
      getDocFromServer(doc(ecosystem, 'apps/probe/users', uid)),
      getDocFromServer(doc(ecosystem, 'grants', uid)),
    ])
    const stamp = membership.data()?.created.at
    return Boolean(stamp?.isEqual(grant.data()?.membership_created_at))
  }
  assert.equal(await canRead(), true)
  await ecosystemAdmin.doc('apps/probe/users/' + uid).delete()
  assert.equal(await canRead(), false)
  await ecosystemAdmin
    .doc('apps/probe/users/' + uid)
    .set({ created: { at: new Timestamp(101, 0) } })
  assert.equal(await canRead(), false)
  await assert.rejects(getDocFromServer(doc(ecosystem, 'kitchens', 'a')), {
    code: 'permission-denied',
  })
  console.log(
    'PASS stale grant rejected after membership removal and recreation'
  )

  const cookie = await adminAuth.createSessionCookie(token, {
    expiresIn: 60 * 60 * 1000,
  })
  const base = 'http://127.0.0.1:18745/session'
  for (const [header, expected] of [
    ['', 'signed out'],
    ['fixture_session=invalid', 'signed out'],
    ['fixture_session=' + cookie, uid],
  ]) {
    const response = await fetch(base, { headers: { cookie: header } })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    const html = await response.text()
    assert.ok(html.includes('<h1>' + expected + '</h1>'))
    assert.ok(!html.includes(cookie))
  }
  console.log(
    'PASS Nuxt SSR verifies session cookie and excludes it from the payload'
  )
} finally {
  await Promise.all([terminate(ecosystem), terminate(identity)])
}
