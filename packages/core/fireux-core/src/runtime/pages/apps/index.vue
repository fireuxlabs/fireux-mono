<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UCard>
        <template #header><h2>Current App (raw)</h2></template>
        <pre class="text-xs whitespace-pre-wrap">{{ app }}</pre>
      </UCard>

      <UCard>
        <template #header><h2>All Apps (raw)</h2></template>
        <pre class="text-xs whitespace-pre-wrap">{{ apps }}</pre>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'

const { app } = useApp()
const { apps } = useAppCollection()
</script>
