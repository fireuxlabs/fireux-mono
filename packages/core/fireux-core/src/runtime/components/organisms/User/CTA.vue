<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue -->
<template>
  <UPageCTA
    class="cta"
    title="Current user"
    description="The user currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <div v-if="isResolved && isInitialized && currentUser" class="cta__body space-y-3">
        <div class="cta__toolbar flex justify-end">
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
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser';
import { useCardViewToggle } from '../../../composables/shared/useCardViewToggle';

const { isResolved, isInitialized, currentUser, card } = useUser()
const { view, toggleView } = useCardViewToggle(() => Boolean(currentUser.value))
</script>
