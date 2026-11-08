<template>
  <div class="cta__body">
    <div class="cta__toolbar">
      <UButton
        size="xs"
        variant="ghost"
        :icon="view === 'preview' ? 'i-lucide-id-card' : 'i-lucide-eye'"
        :aria-label="
          view === 'preview'
            ? 'Switch to profile view'
            : 'Switch to preview view'
        "
        :title="view === 'preview' ? 'Profile' : 'Preview'"
        @click="toggleView"
      />
    </div>

    <UserCardsSummary
      v-if="view === 'preview'"
      :avatar-url="presentation?.avatarUrl"
      :handle-label="presentation?.handleLabel"
      :display-name="currentUser.display_name"
      :bio="currentUser.bio"
    />

    <UserIdentitySummary v-else :user="currentUser" />
  </div>
</template>

<script setup lang="ts">
import type { User } from '../../models/user.model.ts'
import { computed } from 'vue'
import { useUserView } from '../../composables/useUserView'
import { useCardViewToggle } from '../../../composables/shared/useCardViewToggle'

const props = defineProps<{
  currentUser: User
}>()

const { toView } = useUserView()
const presentation = computed(() => toView(props.currentUser))
const { view, toggleView } = useCardViewToggle(() => Boolean(props.currentUser))
</script>
