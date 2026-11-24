import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
if (
  process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:18744' ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:19099'
)
  throw Error('emulators required')
const app = initializeApp({ projectId: 'demo-native-foundation' })
const db = getFirestore(app, 'probe')
if (process.argv[2] === 'revoke') {
  await db.doc('grants/alice').update({ allowed: false })
} else {
  for (const uid of ['alice', 'bob']) {
    await getAuth(app).createUser({
      uid,
      email: uid + '@example.test',
      password: 'fixture-password',
    })
    const at = new Timestamp(100, 0)
    await db.doc('apps/probe/users/' + uid).set({ created: { at } })
    await db
      .doc('grants/' + uid)
      .set({ allowed: true, membership_created_at: at })
  }
  await db
    .doc('kitchens/a')
    .set({
      name: 'Alpha kitchen',
      published: true,
      privateNote: 'must not enter SSR',
    })
  await db.doc('kitchens/b').set({ name: 'Bravo kitchen', published: false })
}
