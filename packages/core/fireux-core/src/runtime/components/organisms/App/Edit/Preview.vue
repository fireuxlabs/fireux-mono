<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Edit/Preview.vue -->
<template>
  <section class="space-y-4">
    <UCard v-if="isLoading">
      <p class="fx-preview__fallback">Loading app preview…</p>
    </UCard>

    <UCard v-else-if="hasPreview" class="space-y-6">
      <header class="fx-preview__header">
        <p class="fx-preview__eyebrow">Directory preview</p>
        <p class="fx-preview__copy">
          Live view of how this app appears across FireUX surfaces.
        </p>
      </header>

      <div class="grid gap-4 lg:grid-cols-2">
        <OrganismsAppCardsPill v-if="pill" :app="pill" />
        <OrganismsAppCardsCell v-if="cell" :app="cell" />
      </div>

      <OrganismsAppCardsProfile v-if="profile" :app="profile" />
    </UCard>

    <UCard v-else>
      <p class="fx-preview__fallback">App preview unavailable.</p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../../../../composables/firestore/core/app/useApp.ts'

const { app, pending, pillProps, cellProps, profileProps } = useApp()

const currentApp = computed(() => app.value ?? null)
const pill = computed(() =>
  currentApp.value ? pillProps(currentApp.value) : null
)
const cell = computed(() =>
  currentApp.value ? cellProps(currentApp.value) : null
)
const profile = computed(() =>
  currentApp.value ? profileProps(currentApp.value) : null
)

const isLoading = computed(() => app.value === undefined || pending.value)
const hasPreview = computed(() => Boolean(currentApp.value))
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
  margin: 0;
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
