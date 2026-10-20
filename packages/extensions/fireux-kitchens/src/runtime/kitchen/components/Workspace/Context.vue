<template>
  <ContextEditor
    :key="state.scopeKey.value"
    :title="title"
    :value="state.context.value"
    :ready="state.ready.value"
    :pending="state.pending.value"
    :saving="state.saving.value"
    :error="state.error.value"
    :disabled="!canWrite"
    @update="state.update"
    @reload="state.load"
  />
</template>
<script setup lang="ts">
import { useRecordContext } from 'fireux-core/runtime/composables/shared/useRecordContext'
const props = defineProps<{
  kitchenId: string
  subject: 'kitchen' | 'venue' | 'menu'
  menuId?: string
  title: string
  canWrite: boolean
}>()
const state = useRecordContext('/api/workspace/kitchen/context', () =>
  props.kitchenId
    ? {
        kitchenId: props.kitchenId,
        subject: props.subject,
        ...(props.subject === 'menu' ? { menuId: props.menuId || '' } : {}),
      }
    : null
)
</script>
