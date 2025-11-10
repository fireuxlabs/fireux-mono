<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h2>{{ headerTitle }}</h2>
        <p>{{ headerDescription }}</p>
      </template>

      <div v-if="current" class="space-y-4">
        <MoleculesPill v-if="currentPill" v-bind="currentPill" />
        <OrganismsAppCardsCell :app="current" :to="appLink" />
      </div>

      <p v-else>No app loaded.</p>
    </UCard>

    <OrganismsAppCardsProfile v-if="showExtended && profile" :app="profile" />

    <OrganismsAppSectionsSubcollection
      v-if="showExtended"
      :app-id="subcollectionId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App, AppCard } from 'fireux-core/runtime/models/core/app.model.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'

const props = withDefaults(
  defineProps<{ app?: App | null; compact?: boolean }>(),
  {
    compact: true,
  }
)

const { app: runtimeApp, pillProps, profileProps } = useApp()

const current = computed<App | null>(
  () => props.app ?? runtimeApp.value ?? null
)

const headerTitle = computed(() => current.value?.app_name ?? 'App')
const headerDescription = computed(
  () => current.value?.description ?? 'App details'
)

const currentPill = computed<Pill.Props | null>(() =>
  current.value ? pillProps(current.value) : null
)

const appLink = computed(() => currentPill.value?.to ?? null)

const profile = computed<AppCard.Profile | null>(() =>
  current.value ? profileProps(current.value) : null
)

const showExtended = computed(() => !props.compact)
const subcollectionId = computed(() => current.value?.id ?? null)
</script>
