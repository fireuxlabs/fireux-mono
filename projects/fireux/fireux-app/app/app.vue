<template>
  <pre v-if="users">{{ users }}</pre>
  <pre v-else>Loading…</pre>
</template>

<script setup lang="ts">
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'

const { firestoreFetchCollection } = useFirestoreRead()

// 🔑 THIS is the test
const users = firestoreFetchCollection<any>('users')
</script>