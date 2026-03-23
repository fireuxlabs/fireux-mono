<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Portfolio details</div>
        <div class="text-xs text-dimmed">
          Portfolios group property operations, finance, compliance, and documents.
        </div>
      </div>
    </template>

    <PortfolioCreateForm
      :mode="props.mode ?? 'console'"
      :return-to="returnTo"
      :cancel-to="cancelTo"
      @created="$emit('created', $event)"
    />
  </UCard>
</template>

<script setup lang="ts">
import type {
  ConsoleCreateMode,
  ConsoleEnsureResult,
} from 'fireux-core/runtime/composables/fireux/firestore/system/console/mutations/useConsoleEnsure'
import PortfolioCreateForm from './Form.vue'

const props = defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (event: 'created', result: ConsoleEnsureResult): void
}>()
</script>
