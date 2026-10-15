<template>
  <UCard class="kitchen-ai-command-result" aria-live="polite">
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <div
          class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
        >
          <UIcon
            :name="pending ? 'i-lucide-wand-sparkles' : 'i-lucide-circle-check'"
            class="size-5"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-dimmed">
            {{ pending ? 'Ready for approval' : 'Result' }}
          </p>
          <p class="mt-1 text-sm text-toned">{{ result.text }}</p>
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

      <div v-if="pending" class="flex justify-end gap-2">
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
      <div v-else class="flex justify-end">
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
import type { KitchenAIResultAction, KitchenAIWelcomeMessage } from '../../../models/kitchen-ai-presentation.model'

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
