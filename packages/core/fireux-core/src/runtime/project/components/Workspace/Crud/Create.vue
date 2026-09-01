<template>
  <UModal
    :open="open"
    title="Create Project"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <WorkspaceProjectCreateForm @created="created" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  refresh: () => Promise<unknown>
}>()

const emit = defineEmits<{
  (event: 'update:open', open: boolean): void
}>()

async function created() {
  await props.refresh()
  emit('update:open', false)
}
</script>
