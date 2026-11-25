<template>
  <UContainer>
    <UPageHeader title="Hello FireUX World" />

    <UAlert v-if="read.status === 'loading'" title="Loading App" />
    <UAlert v-else-if="read.status === 'setup'" title="Configure the local Firestore emulator" />
    <UAlert v-else-if="read.status === 'missing'" title="App not found" />
    <UAlert v-else-if="read.status === 'error'" color="error" title="Could not read App" />
    <UAlert v-else-if="read.status === 'ready'" :title="read.app.name" :description="read.app.id" />
  </UContainer>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import type { App } from 'fireux-core/app'

const { appId } = useAppConfig().fireux
const { $firestore } = useNuxtApp()
const { projectId, databaseId, emulatorHost, emulatorPort } = useRuntimeConfig().public.firebase

const read = ref<
  | { status: 'loading' | 'setup' | 'missing' | 'error' }
  | { status: 'ready'; app: Pick<App, 'id' | 'name'> }
>({ status: 'loading' })

onMounted(async () => {
  if (!$firestore || projectId !== 'demo-fireux-blank' ||
    (databaseId && databaseId !== '(default)') ||
    emulatorHost !== '127.0.0.1' || !emulatorPort) {
    read.value = { status: 'setup' }
    return
  }

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
