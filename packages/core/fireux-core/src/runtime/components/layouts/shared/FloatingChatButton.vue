<template>
  <ClientOnly>
    <div
      v-if="showChatButton"
      class="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6"
    >
      <UButton
        to="/chat"
        icon="i-lucide-message-circle"
        color="primary"
        size="lg"
        class="shadow-lg"
        aria-label="Open chat"
      >
        Chat
      </UButton>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useRoute } from 'vue-router'

const route = useRoute()

const showChatButton = computed(() => {
  const path = String(route.path || '')
  return path !== '/chat'
})
</script>
