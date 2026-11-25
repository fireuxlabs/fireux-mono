<template>
  <UCard>
    <template #header><h2>My App</h2></template>

    <UAlert v-if="read.status === 'loading'" title="Loading App" />
    <UAlert v-else-if="read.status === 'setup'" title="Configure the local Firestore emulator" />
    <UAlert v-else-if="read.status === 'missing'" title="App not found" />
    <UAlert v-else-if="read.status === 'error'" color="error" title="Could not read App" />
    <UPageCard v-else-if="read.status === 'ready'" :as="{ title: 'h3' }" :title="read.app.name">
      <template v-if="read.app.logoUrl" #leading>
        <UAvatar :src="read.app.logoUrl" :alt="read.app.name" />
      </template>
      <template #description>
        <p v-if="read.app.tagline">{{ read.app.tagline }}</p>
        <p v-if="read.app.description">{{ read.app.description }}</p>
        <p>{{ read.app.id }}</p>
      </template>
      <template #footer>
        <UBadge v-if="read.app.role" color="neutral">{{ read.app.role }}</UBadge>
        <UBadge v-if="read.app.status" :color="read.app.status === 'active' ? 'success' : 'neutral'">
          {{ read.app.status }}
        </UBadge>
        <UButton v-for="link in read.app.links" :key="link.label" :to="link.to" variant="link">
          {{ link.label }}
        </UButton>
      </template>
      <img v-if="read.app.coverUrl" :src="read.app.coverUrl" alt="" loading="lazy">
    </UPageCard>
  </UCard>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { readAppDetail, type AppDetailDisplay } from '../app-display'

const { appId } = useAppConfig().fireux
const { $firestore } = useNuxtApp()

const read = ref<
  | { status: 'loading' | 'setup' | 'missing' | 'error' }
  | { status: 'ready'; app: AppDetailDisplay }
>({ status: 'loading' })

onMounted(async () => {
  if (!$firestore) {
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

    const app = readAppDetail(snapshot.id, snapshot.data())
    read.value = app
      ? { status: 'ready', app }
      : { status: 'error' }
  } catch {
    read.value = { status: 'error' }
  }
})
</script>
