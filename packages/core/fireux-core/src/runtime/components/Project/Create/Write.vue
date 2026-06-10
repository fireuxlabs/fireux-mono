<template>
  <div class="space-y-4">
    <UAlert
      color="warning"
      variant="soft"
      title="Project endpoint ingest is disabled"
      description="The old /api/fireux-console project-create parser was removed because it was not canon. Rebuild endpoint ingest through the shared endpoint contract before using this flow."
    />

    <DevJson
      title="Project Create Debug"
      context="console/project · endpoint ingest disabled"
      :data="debugState"
      :default-open="true"
    />

    <div class="flex flex-wrap gap-2">
      <UButton
        color="primary"
        icon="i-lucide-plus"
        disabled
      >
        Create project
      </UButton>
      <UButton
        v-if="cancelTo"
        :to="cancelTo"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Cancel
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  ConsoleCreateMode,
  ConsoleCreateResult,
} from '../../../composables/fireux/firestore/system/console/mutations/useConsoleCreate'

const props = withDefaults(defineProps<{
  mode?: ConsoleCreateMode
  returnTo?: string
  cancelTo?: string
}>(), {
  mode: 'console',
  returnTo: '',
  cancelTo: '',
})

defineEmits<{
  (event: 'created', result: ConsoleCreateResult): void
}>()

const debugState = computed(() => ({
  mode: props.mode,
  returnTo: props.returnTo,
  cancelTo: props.cancelTo,
  endpointIngest: 'disabled',
  reason: 'Legacy endpoint parser removed; rebuild endpoint ingest canonically.',
}))
</script>
