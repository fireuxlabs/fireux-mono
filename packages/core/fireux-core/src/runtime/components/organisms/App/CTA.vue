<template>
  <UPageCTA
    title="Current app"
    description="The app currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <OrganismsAppCardsPreview v-if="isResolved && isInitialized" />
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
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'

const { isResolved, isInitialized } = useApp()
</script>
