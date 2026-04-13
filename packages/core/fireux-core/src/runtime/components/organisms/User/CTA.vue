<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue -->
<template>
  <UPageCTA
    :class="['cta', { 'cta--usage': isResolved && isInitialized && currentUser }]"
    :title="isResolved && isInitialized && currentUser ? undefined : 'Current User'"
    :description="isResolved && isInitialized && currentUser ? undefined : 'Sign in to view or create your profile.'"
    variant="naked"
  >
    <template #default>
      <div v-if="isResolved && isInitialized && currentUser" class="cta__body space-y-2">
        <div class="cta__toolbar flex justify-end">
          <UButton
            size="xs"
            variant="ghost"
            :icon="view === 'preview' ? 'i-lucide-id-card' : 'i-lucide-eye'"
            :aria-label="view === 'preview' ? 'Switch to profile view' : 'Switch to preview view'"
            :title="view === 'preview' ? 'Profile' : 'Preview'"
            @click="toggleView"
          />
        </div>

        <UserCardsPreview
          v-if="view === 'preview'"
          v-bind="userInterface(currentUser)"
        />

        <UserCardsProfile
          v-else
          v-bind="userInterface(currentUser)"
          :user="currentUser"
        />
      </div>

      <UserCreateSystem v-else />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import { useCardViewToggle } from '../../../composables/shared/useCardViewToggle'

const { isResolved, isInitialized, currentUser, pill: userInterface } = useUser()
const { view, toggleView } = useCardViewToggle(() => Boolean(currentUser.value))
</script>
