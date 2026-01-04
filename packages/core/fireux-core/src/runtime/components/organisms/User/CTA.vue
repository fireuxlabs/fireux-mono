<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue -->
<template>
  <UPageCTA
    title="Current user"
    description="The user currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <OrganismsUserCardsPreview
        v-if="isResolved && isInitialized && currentUser"
        :card="card(currentUser)"
      />
      <OrganismsUserCreateSystem v-else />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

const { isResolved, isInitialized, currentUser, card } = useUser()
</script>
