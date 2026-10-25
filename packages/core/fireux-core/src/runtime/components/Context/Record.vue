<template>
  <FireContextEditor
    :key="state.scopeKey.value"
    :title="title"
    :value="state.context.value"
    :ready="state.ready.value"
    :pending="state.pending.value"
    :saving="state.saving.value"
    :error="state.error.value"
    :disabled="disabled"
    :maxlength="maxlength"
    @update="state.update"
    @reload="state.load"
  />
</template>
<script setup lang="ts">
import { useRecordContext } from '../../composables/shared/useRecordContext'
const props = defineProps<{
  endpoint: string
  scope: Record<string, string> | null
  title: string
  disabled?: boolean
  maxlength?: number
}>()
const state = useRecordContext(
  () => props.endpoint,
  () => props.scope
)
</script>
