<template>
  <UPageCTA
    title="Current app"
    description="The app currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <OrganismsAppCardsPreview v-if="appCard" v-bind="appCard" />
      <OrganismsAppCreateSystem v-else />
         <UButton
          variant="ghost"
          size="sm"
          to="/learn-more"
        >
          Learn more
        </UButton>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'

const { app, card, isResolved, isInitialized } = useApp()
const appCard = computed(() =>
  isResolved.value && isInitialized.value && app.value ? card(app.value) : null
)
</script>
