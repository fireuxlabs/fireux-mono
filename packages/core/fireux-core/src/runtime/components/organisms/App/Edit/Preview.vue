<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Edit/Preview.vue -->
<template>
  <ClientOnly>
        <OrganismsAppCardsPill v-if="pill" :app="pill" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../../../../composables/firestore/core/app/useApp.ts'

const { app, pending, pillProps } = useApp()

const pill = computed(() => pillProps())

const isLoading = computed(() => app.value === undefined || pending.value)
const hasPreview = computed(() => Boolean(pill.value))
</script>

<style scoped>
.fx-preview__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fx-preview__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.6);
}

.fx-preview__copy {
  font-size: 0.875rem;
  color: rgba(15, 23, 42, 0.85);
  margin: 0.25rem 0 0;
}

.fx-preview__fallback {
  margin: 0;
  padding: 1.25rem 0;
  text-align: center;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.6);
}
</style>
