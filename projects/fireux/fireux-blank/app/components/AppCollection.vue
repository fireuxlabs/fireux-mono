<template>
  <UCard>
    <template #header><h2>Apps in this database</h2></template>

    <UAlert v-if="read.status === 'loading'" title="Loading Apps" />
    <UAlert v-else-if="read.status === 'setup'" title="Configure the local Firestore emulator" />
    <UAlert v-else-if="read.status === 'empty'" title="No Apps in this database" />
    <UAlert v-else-if="read.status === 'error'" color="error" title="Could not read Apps" />
    <UPageGrid v-else-if="read.status === 'ready'" as="ul">
      <li v-for="app in read.apps" :key="app.id">
        <UPageCard :as="{ title: 'h3' }" :title="app.name">
          <template #description>
            <p v-if="app.tagline">{{ app.tagline }}</p>
            <p>{{ app.id }}</p>
          </template>
          <template v-if="app.role || app.status" #footer>
            <UBadge v-if="app.role" color="neutral">{{ app.role }}</UBadge>
            <UBadge v-if="app.status" :color="app.status === 'active' ? 'success' : 'neutral'">
              {{ app.status }}
            </UBadge>
          </template>
        </UPageCard>
      </li>
    </UPageGrid>
  </UCard>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { readAppSummary, type AppSummary } from '../app-display'

const { $firestore } = useNuxtApp()

const read = ref<
  | { status: 'loading' | 'setup' | 'empty' | 'error' }
  | { status: 'ready'; apps: AppSummary[] }
>({ status: 'loading' })

onMounted(async () => {
  if (!$firestore) {
    read.value = { status: 'setup' }
    return
  }

  try {
    const snapshot = await getDocs(collection($firestore, 'apps'))
    if (snapshot.metadata.fromCache) {
      read.value = { status: 'error' }
      return
    }
    if (snapshot.empty) {
      read.value = { status: 'empty' }
      return
    }

    const apps: AppSummary[] = []
    for (const document of snapshot.docs) {
      const app = readAppSummary(document.id, document.data())
      if (!app) {
        read.value = { status: 'error' }
        return
      }
      apps.push(app)
    }
    read.value = { status: 'ready', apps }
  } catch {
    read.value = { status: 'error' }
  }
})
</script>
