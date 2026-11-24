<template>
  <UContainer>
    <UPageHeader title="Hello FireUX World" />

    <UAlert v-if="read.status === 'loading'" title="Loading Firestore document" />
    <UAlert v-else-if="read.status === 'setup'" title="Configure the local Firestore emulator" />
    <UAlert v-else-if="read.status === 'missing'" title="Firestore document not found" />
    <UAlert v-else-if="read.status === 'error'" color="error" title="Could not read Firestore document" />
    <UAlert v-else-if="read.status === 'ready'" :title="read.id" :description="read.message" />
  </UContainer>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'

const { $firestore } = useNuxtApp()
const { projectId, databaseId, emulatorHost, emulatorPort } = useRuntimeConfig().public.firebase

const read = ref<
  | { status: 'loading' | 'setup' | 'missing' | 'error' }
  | { status: 'ready'; id: string; message: string }
>({ status: 'loading' })

onMounted(async () => {
  if (!$firestore || projectId !== 'demo-fireux-blank' ||
    (databaseId && databaseId !== '(default)') ||
    emulatorHost !== '127.0.0.1' || !emulatorPort) {
    read.value = { status: 'setup' }
    return
  }

  try {
    const snapshot = await getDoc(doc($firestore, 'examples', 'hello'))
    if (snapshot.metadata.fromCache) {
      read.value = { status: 'error' }
      return
    }
    if (!snapshot.exists()) {
      read.value = { status: 'missing' }
      return
    }

    const message = snapshot.get('message')
    read.value = typeof message === 'string'
      ? { status: 'ready', id: snapshot.id, message }
      : { status: 'error' }
  } catch {
    read.value = { status: 'error' }
  }
})
</script>
