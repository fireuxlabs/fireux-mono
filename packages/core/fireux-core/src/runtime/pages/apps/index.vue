<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageBody class="page-index">
      <UPageHeader title="Apps" description="Review the current runtime app." />

      <!-- Single -->
      <UCard class="index-card">
        <template #header>
          <div class="index-card-header">
            <h1 class="index-title">Current App</h1>
          </div>
        </template>

        <template v-if="app">
          <MoleculesPill v-bind="pillProps(app)" />
          <OrganismsAppCardsCell :app="app" />
        </template>

        <MoleculesNotFound v-else kind="document" entity="app" />
      </UCard>

      <!-- Collection -->
      <UCard class="index-card">
        <div v-if="apps?.length" class="entity-grid">
          <MoleculesPill
            v-for="item in apps"
            :key="item.id"
            v-bind="pillProps(item)"
          />
        </div>

        <MoleculesNotFound v-else kind="collection" entity="apps" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import 'fireux-core/runtime/assets/styles/scss/pages/indexes.scss'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-grid',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Apps',
  description: 'Registered FireUX apps',
})

const { app, pillProps } = useApp()
const { apps } = useAppCollection()
</script>
