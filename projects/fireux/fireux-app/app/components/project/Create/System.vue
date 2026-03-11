<template>
  <ProjectCreateForm
    :return-to="returnTo"
    :cancel-to="cancelTo"
    @created="$emit('created', $event)"
  />
</template>

<script setup lang="ts">
import ProjectCreateForm from './Form.vue'

defineProps<{
  returnTo?: string
  cancelTo?: string
}>()

defineEmits<{
  (event: 'created', projectId: string): void
}>()
</script>
