<template>
  <div>
    <UFormField label="Method" description="One step per line."
      ><UTextarea v-model="method" aria-label="Method" :rows="7"
    /></UFormField>
    <UFormField label="Source / kitchen notes"
      ><UTextarea
        v-model="notes"
        aria-label="Source or kitchen notes"
        :rows="2"
        placeholder="Where this recipe came from; what still needs checking."
    /></UFormField>
    <UFormField label="Status"
      ><USelect
        v-model="status"
        :items="[
          { label: 'Draft — needs review', value: 'draft' },
          { label: 'Reviewed by kitchen', value: 'ready' },
        ]"
        aria-label="Recipe status"
    /></UFormField>
  </div>
</template>
<script setup lang="ts">
const method = defineModel<string>('method', { required: true })
const notes = defineModel<string>('notes', { required: true })
const status = defineModel<'draft' | 'ready'>('status', { required: true })
</script>
