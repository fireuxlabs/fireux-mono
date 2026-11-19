<template>
  <USlideover
    v-model:open="addOpen"
    title="Add ingredient"
    description="Choose from the shared ingredient catalogue."
  >
    <template #body
      ><KitchenWorkspacePrepIngredientsAdd v-if="addOpen && canWrite" />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const addOpen = defineModel<boolean>('open', { required: true })
defineProps<{ canWrite: boolean }>()
</script>
