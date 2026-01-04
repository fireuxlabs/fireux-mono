<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Apps"
      description="Inspect the current app and browse all apps available to this runtime."
    />

    <UPageBody class="pagebody">
      <OrganismsAppCTA />

      <!-- TEST: each card type -->
      <section class="card-test">
        <h3>Testing</h3>

        <div class="card-test-block">
          <h4>Pill</h4>
          <OrganismsAppCardsPill v-if="appCard" v-bind="appCard" />
        </div>

        <div class="card-test-block">
          <h4>Cell</h4>
          <OrganismsAppCardsCell v-if="appCard" v-bind="appCard" />
        </div>

        <div class="card-test-block">
          <h4>Preview</h4>
          <OrganismsAppCardsPreview v-if="appCard" v-bind="appCard" />
        </div>

        <div class="card-test-block">
          <h4>Profile</h4>
          <OrganismsAppCardsProfile v-if="appCard" v-bind="appCard" :app="app" />
        </div>
      </section>

      <OrganismsAppCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Apps',
  description: 'FireUX apps resolved for this runtime.',
  layout: 'default',
  name: 'AppsIndexPage',
  roles: ['global'],
})

useHead({ title: 'Apps' })

const { app, card } = useApp()
const appCard = computed(() => (app.value ? card(app.value) : null))
</script>

<style scoped></style>

