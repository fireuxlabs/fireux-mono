<template>
  <UContainer>
    <UPageHeader title="Hello FireUX World" description="App identity and discovery" />

    <UAlert v-if="read.status === 'setup'" title="Configure the local Firestore emulator" />

    <template v-else>
      <AppDetail :read="read" />
      <AppCollection :read="appsRead" />
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import { collection, doc, getDoc, getDocs, type Firestore } from 'firebase/firestore'
import { readAppDetail, readAppSummary, type AppDetailDisplay, type AppSummary } from '../app-summary'

const { appId } = useAppConfig().fireux
const { $firestore } = useNuxtApp()
const { projectId, databaseId, emulatorHost, emulatorPort } = useRuntimeConfig().public.firebase

const read = ref<
  | { status: 'setup' }
  | { status: 'loading' | 'missing' | 'error' }
  | { status: 'ready'; app: AppDetailDisplay }
>({ status: 'loading' })

const appsRead = ref<
  | { status: 'loading' | 'empty' | 'error' }
  | { status: 'ready'; apps: AppSummary[] }
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

    const apps: AppSummary[] = []
    for (const document of snapshot.docs) {
      const app = readAppSummary(document.id, document.data())
      if (!app) {
        appsRead.value = { status: 'error' }
        return
      }
      apps.push(app)
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

    const app = readAppDetail(snapshot.id, snapshot.data())
    read.value = app
      ? { status: 'ready', app }
      : { status: 'error' }
  } catch {
    read.value = { status: 'error' }
  }
})
</script>
