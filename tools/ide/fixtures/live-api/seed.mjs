import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { fixtureMenuRecords } from './server/utils/menu-records.mjs'

const projectId = 'demo-fireux-live'
if (
  process.env.FIREUX_LIVE_FIXTURE !== projectId ||
  process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8181' ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9199'
)
  throw new Error('Fixture emulator environment is required.')
const count = Number(process.argv[2] || 10)
if (!Number.isInteger(count) || count < 10 || count > 500)
  throw new Error('Choose 10 through 500 Kitchens.')
const app = initializeApp({ projectId })
const db = getFirestore(app, 'fireux')
const kitchens = getFirestore(app, 'misebox')
const identity = getFirestore(app, 'live-identity')
const at = { seconds: 1800000000, nanoseconds: 0 }
const stamp = { at, by: 'fixture-actor' }
const auth = getAuth(app)
await auth.getUser('fixture-actor').then(
  () =>
    auth.updateUser('fixture-actor', {
      disabled: false,
      password: 'fixture-password-123',
    }),
  () =>
    auth.createUser({
      uid: 'fixture-actor',
      email: 'actor@fixture.test',
      password: 'fixture-password-123',
    })
)
await db.doc('apps/fireux-app').set({
  ecosystem_id: 'fireux',
  role: 'global',
  status: 'active',
  name: 'Fixture',
  created: stamp,
  updated: stamp,
})
await db.doc('apps/fireux-app/users/fixture-actor').set({
  role: 'user',
  subscription: 'business',
  created: stamp,
  updated: stamp,
})
await db
  .doc('project_access/fireux-app/users/fixture-actor')
  .set({ ids: ['project-a', 'project-b'], membership_created_at: at })
for (const id of ['project-a', 'project-b']) {
  await db.doc(`projects/${id}`).set({
    identity: { status: 'active', name: id, description: '', image_url: '' },
    created: stamp,
    updated: stamp,
  })
  await db
    .doc(`projects/${id}/team/local`)
    .set({ name: `${id} local initial`, user_id: '', role_ids: [] })
  await db.doc(`projects/${id}/team/linked`).set({
    name: 'stored fallback',
    user_id: 'linked-user',
    role_ids: ['operator'],
  })
}
await identity.doc('users/linked-user').set({
  display_name: 'Identity initial',
  handle: 'linked-user',
  private_note: 'PRIVATE_IDENTITY_MARKER',
})
await db
  .doc('users/linked-user')
  .set({ display_name: 'DECOY wrong database', handle: 'decoy-user' })
for (const database of [db, kitchens, identity])
  await database
    .doc('probes/same')
    .set({ value: `${database.databaseId} initial` })
for (let offset = 0; offset < count; offset += 200) {
  const batch = kitchens.batch()
  for (let index = offset; index < Math.min(count, offset + 200); index++) {
    const id = `place-${String(index).padStart(3, '0')}`
    batch.set(kitchens.doc(`places/${id}`), {
      name: `${id} initial`,
      place_type: 'physical',
      timezone: 'Europe/Zurich',
      default_currency_code: 'CHF',
      country_code: 'CH',
    })
    batch.set(kitchens.doc(`kitchens/${id}`), {
      identity: { slug: id, status: 'active', visibility: true },
      services: { item_images: false },
      context: 'PRIVATE_KITCHEN_MARKER',
      created: stamp,
      updated: stamp,
    })
  }
  await batch.commit()
}
const menuBatch = kitchens.batch()
for (const [path, record] of fixtureMenuRecords(stamp))
  menuBatch.set(kitchens.doc(path), record)
await menuBatch.commit()
console.log(
  `Seeded ${count} Kitchens, a canonical published special with a reusable Item, two Projects and one Auth actor in ${projectId}; named databases misebox/fireux/live-identity. Sproochli is disabled; no translation provider branch is exercised.`
)
await Promise.all([db.terminate(), kitchens.terminate(), identity.terminate()])
