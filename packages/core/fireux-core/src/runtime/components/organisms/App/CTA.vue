<template>
  <UPageCTA
    title="Current app"
    description="The app currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <OrganismsAppCardsPreview v-if="isResolved && isInitialized && app?.id" />
      <OrganismsAppCreateSystem v-else />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'

const { app, isResolved, isInitialized } = useApp()
</script>
