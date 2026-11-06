<template>
  <UCard class="kitchen-ai-command-result" aria-live="polite">
    <div class="workspace-surface workspace-surface--compact">
      <div class="card__media">
        <div
          class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10"
        >
          <UIcon
            :name="pending ? 'i-lucide-wand-sparkles' : 'i-lucide-circle-check'"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p>
            {{ pending ? 'Ready for approval' : 'Result' }}
          </p>
          <p class="mt-1">{{ result.text }}</p>
        </div>
      </div>

      <WorkspaceKitchenAICreatedObject
        v-if="result.createdObject"
        v-bind="result.createdObject"
      />
      <UButton
        v-if="result.resultAction?.kind === 'copy'"
        :label="result.resultAction.label"
        icon="i-lucide-copy"
        color="primary"
        variant="soft"
        @click="emit('copy', result.resultAction)"
      />

      <div v-if="pending" class="fx-card__actions">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          @click="emit('reset')"
        />
        <UButton
          label="Confirm action"
          icon="i-lucide-play"
          :loading="submitting"
          @click="emit('confirm')"
        />
      </div>
      <div v-else class="fx-card__actions">
        <UButton
          label="New request"
          color="neutral"
          variant="ghost"
          icon="i-lucide-rotate-ccw"
          @click="emit('reset')"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type {
  KitchenAIResultAction,
  KitchenAIWelcomeMessage,
} from '../../../models/kitchen-ai-presentation.model'

withDefaults(
  defineProps<{
    result: KitchenAIWelcomeMessage
    pending?: boolean
    submitting?: boolean
  }>(),
  { pending: false, submitting: false }
)
const emit = defineEmits<{
  confirm: []
  reset: []
  copy: [action: KitchenAIResultAction]
}>()
</script>
