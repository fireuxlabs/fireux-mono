<template>
  <UPageCTA
    title="Current app"
    description="The app currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <div class="space-y-3">
        <OrganismsAppCardsPreview v-if="app" v-bind="card(app)" />
        <OrganismsAppCreateSystem v-else />

        <div class="flex justify-end">
          <UButton variant="ghost" size="sm" to="/learn-more">Learn more</UButton>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'

const { app, card } = useApp()
</script>
