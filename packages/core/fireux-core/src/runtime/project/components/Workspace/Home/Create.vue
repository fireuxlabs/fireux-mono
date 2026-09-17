<template>
  <UModal
    :open="open"
    title="Create Project"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <WorkspaceProjectHomeCreateForm @created="created" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
}>()

function created() {
  emit('update:open', false)
}
</script>
