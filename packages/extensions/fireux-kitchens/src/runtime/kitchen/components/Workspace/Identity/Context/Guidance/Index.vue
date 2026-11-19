<template>
  <WorkspaceKitchenIdentityContextGuidanceChoices
    :key="state.scopeKey.value"
    :value="state.value.value"
    :disabled="!canWrite || !state.ready.value"
    :saving="state.saving.value"
    :saved="state.saved.value"
    :error="state.error.value"
    @save="state.save"
    @reload="state.reload"
  />
</template>
<script setup lang="ts">
import { useKitchenGuidance } from '../../../../../composables/workspace/useKitchenGuidance'
const props = defineProps<{ kitchenId: string; canWrite: boolean }>()
const state = useKitchenGuidance(
  () => props.kitchenId,
  () => props.canWrite
)
</script>
