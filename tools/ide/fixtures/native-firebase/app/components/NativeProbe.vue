<template>
  <section>
    <p>Auth: {{ ready ? (user?.uid ?? 'signed out') : 'pending' }}</p>
    <p>Live Kitchen: {{ kitchen?.name ?? 'none' }}</p>
    <button @click="run">Run native checks</button>
    <pre>{{ report.join('\n') }}</pre>
  </section>
</template>
<script setup lang="ts">
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
const { auth, db, ready, user } = useNuxtApp().$firebase
const allowed = ref(false)
const kitchen = shallowRef<{ name: string } | null>(null)
const requested = ref('a')
const report = ref<string[]>([])
const active = ref(true)
const subscriptions = { opened: 0, closed: 0 }

watch(
  () => user.value?.uid,
  (uid, _, cleanup) => {
    allowed.value = false
    if (uid)
      cleanup(
        onSnapshot(
          doc(db, 'grants', uid),
          (row) => {
            allowed.value = row.data()?.allowed === true
          },
          () => {
            allowed.value = false
          }
        )
      )
  },
  { immediate: true, flush: 'sync' }
)

watch(
  [() => user.value?.uid, allowed, requested, active],
  ([uid, grant, id, enabled], _, cleanup) => {
    kitchen.value = null
    if (!uid || !grant || !enabled) return
    const unsubscribe = onSnapshot(
      doc(db, 'kitchens', id),
      (row) => {
        kitchen.value = row.exists() ? { name: row.data().name } : null
      },
      () => {
        kitchen.value = null
      }
    )
    subscriptions.opened++
    cleanup(() => {
      unsubscribe()
      subscriptions.closed++
    })
  },
  { immediate: true, flush: 'sync' }
)

async function until(condition: () => boolean) {
  for (let attempt = 0; attempt < 1200; attempt++) {
    if (condition()) return
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
  throw Error('State did not settle')
}
function check(condition: boolean, label: string) {
  if (!condition) throw Error(label)
  report.value.push('PASS ' + label)
}
async function run() {
  report.value = []
  try {
    await until(() => ready.value)
    check(ready.value, 'configured named database and Auth readiness')
    await signInWithEmailAndPassword(
      auth,
      'alice@example.test',
      'fixture-password'
    )
    await until(() => kitchen.value?.name === 'Alpha kitchen')
    check(
      user.value?.uid === 'alice',
      'reactive auth and grant-first live document'
    )
    check(
      (await getDoc(doc(db, 'kitchens', 'a'))).data()?.name === 'Alpha kitchen',
      'one-time document'
    )
    check(
      (await getDocs(collection(db, 'kitchens'))).size === 2,
      'one-time collection'
    )
    const token = await user.value!.getIdToken()
    const write = (name: string) =>
      $fetch('/api/rename', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: { name },
      })
    try {
      await updateDoc(doc(db, 'kitchens', 'a'), { name: 'forbidden' })
      throw Error('client write unexpectedly allowed')
    } catch (e) {
      check(
        (e as { code?: string }).code === 'permission-denied',
        'Rules block direct write'
      )
    }
    await write('Renamed kitchen')
    await until(() => kitchen.value?.name === 'Renamed kitchen')
    check(true, 'trusted command write and live update')
    requested.value = 'b'
    check(
      kitchen.value === null,
      'route change clears stale record immediately'
    )
    await until(() => kitchen.value?.name === 'Bravo kitchen')
    requested.value = 'a'
    await until(() => kitchen.value?.name === 'Renamed kitchen')
    await signInWithEmailAndPassword(
      auth,
      'bob@example.test',
      'fixture-password'
    )
    await until(
      () =>
        user.value?.uid === 'bob' && kitchen.value?.name === 'Renamed kitchen'
    )
    check(
      subscriptions.opened >= 4 &&
        subscriptions.opened === subscriptions.closed + 1,
      'same-path account switch rebinds'
    )
    active.value = false
    check(
      kitchen.value === null && subscriptions.opened === subscriptions.closed,
      'disposal closes listener'
    )
    active.value = true
    await signOut(auth)
    await until(() => user.value === null)
    check(
      kitchen.value === null && subscriptions.opened === subscriptions.closed,
      'sign-out clears read and closes listener'
    )
    await signInWithEmailAndPassword(
      auth,
      'alice@example.test',
      'fixture-password'
    )
    await until(() => kitchen.value?.name === 'Renamed kitchen')
    report.value.push('READY for external grant revocation')
    await until(() => !allowed.value)
    check(
      kitchen.value === null && subscriptions.opened === subscriptions.closed,
      'revocation clears and closes listener'
    )
    try {
      await write('forbidden after revocation')
      throw Error('revoked command unexpectedly succeeded')
    } catch (e) {
      check(
        (e as { status?: number }).status === 403,
        'trusted command rejects revoked grant'
      )
    }
  } catch (e) {
    report.value.push('FAIL ' + String(e))
  }
}
</script>
