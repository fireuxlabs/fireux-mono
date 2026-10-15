<template>
  <div class="kitchen-ai-welcome__messages" aria-live="polite">
    <div
      v-for="message in messages"
      :key="message.id"
      class="kitchen-ai-welcome__message"
      :class="`kitchen-ai-welcome__message--${message.role}`"
    >
      <p>{{ message.text }}</p>
      <WorkspaceKitchenAICreatedObject
        v-if="message.createdObject"
        v-bind="message.createdObject"
      />
      <UButton
        v-if="message.resultAction?.kind === 'copy'"
        class="mt-3"
        :label="message.resultAction.label"
        icon="i-lucide-copy"
        color="primary"
        variant="soft"
        size="sm"
        @click="emit('copy', message.resultAction)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KitchenAIResultAction, KitchenAIWelcomeMessage } from '../../../models/kitchen-ai-presentation.model'

defineProps<{ messages: readonly KitchenAIWelcomeMessage[] }>()
const emit = defineEmits<{ copy: [action: KitchenAIResultAction] }>()
</script>
