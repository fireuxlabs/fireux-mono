<template>
  <UContainer>
    <UPageHeader title="Hello FireUX World" />

    <UAlert v-if="read.status === 'setup'" title="Configure the local Firestore emulator" />

    <template v-else>
      <UCard>
        <template #header><h2>My App</h2></template>

        <UAlert v-if="read.status === 'loading'" title="Loading App" />
        <UAlert v-else-if="read.status === 'missing'" title="App not found" />
        <UAlert v-else-if="read.status === 'error'" color="error" title="Could not read App" />
        <UAlert v-else-if="read.status === 'ready'" :title="read.app.name" :description="read.app.id" />
      </UCard>

      <UCard>
        <template #header><h2>Apps in this database</h2></template>

        <UAlert v-if="appsRead.status === 'loading'" title="Loading Apps" />
        <UAlert v-else-if="appsRead.status === 'empty'" title="No Apps in this database" />
        <UAlert v-else-if="appsRead.status === 'error'" color="error" title="Could not read Apps" />
        <ul v-else-if="appsRead.status === 'ready'">
          <li v-for="app in appsRead.apps" :key="app.id">
            <UAlert :title="app.name" :description="app.id" />
          </li>
        </ul>
      </UCard>
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import { collection, doc, getDoc, getDocs, type Firestore } from 'firebase/firestore'
import type { App } from 'fireux-core/app'

const { appId } = useAppConfig().fireux
const { $firestore } = useNuxtApp()
const { projectId, databaseId, emulatorHost, emulatorPort } = useRuntimeConfig().public.firebase

const read = ref<
  | { status: 'loading' | 'setup' | 'missing' | 'error' }
  | { status: 'ready'; app: Pick<App, 'id' | 'name'> }
>({ status: 'loading' })

const appsRead = ref<
  | { status: 'loading' | 'empty' | 'error' }
  | { status: 'ready'; apps: Pick<App, 'id' | 'name'>[] }
>({ status: 'loading' })

async function readApps(firestore: Firestore) {
  try {
    const snapshot = await getDocs(collection(firestore, 'apps'))
    if (snapshot.metadata.fromCache) {
      appsRead.value = { status: 'error' }
      return
    }
    if (snapshot.empty) {
      appsRead.value = { status: 'empty' }
      return
    }

    const apps: Pick<App, 'id' | 'name'>[] = []
    for (const document of snapshot.docs) {
      const name: unknown = document.get('name')
      if (typeof name !== 'string' || !name.trim()) {
        appsRead.value = { status: 'error' }
        return
      }
      apps.push({ id: document.id, name })
    }
    appsRead.value = { status: 'ready', apps }
  } catch {
    appsRead.value = { status: 'error' }
  }
}

onMounted(async () => {
  if (!$firestore || projectId !== 'demo-fireux-blank' ||
    (databaseId && databaseId !== '(default)') ||
    emulatorHost !== '127.0.0.1' || !emulatorPort) {
    read.value = { status: 'setup' }
    return
  }

  void readApps($firestore)

  try {
    const snapshot = await getDoc(doc($firestore, 'apps', appId))
    if (snapshot.metadata.fromCache) {
      read.value = { status: 'error' }
      return
    }
    if (!snapshot.exists()) {
      read.value = { status: 'missing' }
      return
    }

    const name: unknown = snapshot.get('name')
    read.value = typeof name === 'string' && name.trim()
      ? { status: 'ready', app: { id: snapshot.id, name } }
      : { status: 'error' }
  } catch {
    read.value = { status: 'error' }
  }
})
</script>
