<template>
  <div class="grid gap-6">
    <UFormField label="Method" description="One step per line."
      ><UTextarea v-model="method" aria-label="Method" :rows="7" class="w-full"
    /></UFormField>
    <UFormField label="Source / kitchen notes"
      ><UTextarea
        v-model="notes"
        aria-label="Source or kitchen notes"
        :rows="2"
        placeholder="Where this recipe came from; what still needs checking."
        class="w-full"
    /></UFormField>
    <UFormField label="Status"
      ><USelect
        v-model="status"
        :items="[
          { label: 'Draft — needs review', value: 'draft' },
          { label: 'Reviewed by kitchen', value: 'ready' },
        ]"
        aria-label="Recipe status"
        class="w-full"
    /></UFormField>
  </div>
</template>
<script setup lang="ts">
const method = defineModel<string>('method', { required: true })
const notes = defineModel<string>('notes', { required: true })
const status = defineModel<'draft' | 'ready'>('status', { required: true })
</script>
