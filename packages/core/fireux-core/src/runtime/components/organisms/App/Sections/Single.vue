<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Sections/Single.vue -->
<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h2>{{ current?.app_name ?? 'App' }}</h2>
        <p>{{ current?.description ?? 'App details' }}</p>
      </template>

      <template v-if="current">
        <MoleculesPill v-if="pill" v-bind="pill" />
        <OrganismsAppCardsCell :app="current" :to="appLink" />
      </template>

      <p v-else>No app loaded.</p>
    </UCard>

    <OrganismsAppCardsProfile v-if="showExtended && profile" :app="profile" />

    <OrganismsAppSectionsSubcollection
      v-if="showExtended"
      :app-id="current?.id ?? null"
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

const pill = computed<Pill.Props | null>(() =>
  current.value ? pillProps(current.value) : null
)

const appLink = computed(() => pill.value?.to ?? null)

const profile = computed<AppCard.Profile | null>(() =>
  current.value ? profileProps(current.value) : null
)

const showExtended = computed(() => !props.compact)
</script>
