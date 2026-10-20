<template>
  <ContextEditor
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
import { useKitchenRecordContext } from '../../composables/workspace/useKitchenRecordContext'
const props = defineProps<{
  kitchenId: string
  subject: 'kitchen' | 'venue' | 'menu'
  menuId?: string
  title: string
  canWrite: boolean
}>()
const state = useKitchenRecordContext(() =>
  props.kitchenId
    ? {
        kitchenId: props.kitchenId,
        subject: props.subject,
        ...(props.subject === 'menu' ? { menuId: props.menuId } : {}),
      }
    : null
)
</script>
