<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue -->
<template>
  <UPageCTA
    title="Current user"
    description="The user currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <div v-if="isResolved && isInitialized && currentUser" class="space-y-3">
        <div class="flex justify-end">
          <UButton size="xs" variant="ghost" @click="toggleView">
            {{ view === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </div>

        <OrganismsUserCardsPreview
          v-if="view === 'preview'"
          v-bind="card(currentUser)"
        />

        <OrganismsUserCardsProfile
          v-else
          v-bind="card(currentUser)"
          :user="currentUser"
        />
      </div>

      <OrganismsUserCreateSystem v-else />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useCardViewToggle } from '../../../composables/shared/useCardViewToggle'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

const { isResolved, isInitialized, currentUser, card } = useUser()
const { view, toggleView } = useCardViewToggle(() => Boolean(currentUser.value))
</script>
