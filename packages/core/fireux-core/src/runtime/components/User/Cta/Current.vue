<template>
  <div class="cta__body space-y-2">
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
</template>

<script setup lang="ts">
import type { User } from '../../../models/core/user.model'
import { useUserInterface } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useCardViewToggle } from '../../../composables/shared/useCardViewToggle'

const props = defineProps<{
  currentUser: User
}>()

const { profile: userInterface } = useUserInterface()
const { view, toggleView } = useCardViewToggle(() => Boolean(props.currentUser))
</script>
