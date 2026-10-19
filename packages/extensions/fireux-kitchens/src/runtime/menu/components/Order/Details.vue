<template>
  <UFormField :label="context === 'table' ? 'Name (optional)' : 'Your name'"
    ><UInput v-model="name" :maxlength="200" class="w-full"
  /></UFormField>
  <UFormField v-if="context !== 'table'" label="Contact phone"
    ><UInput v-model="phone" type="tel" :maxlength="64" class="w-full"
  /></UFormField>
  <UFormField v-if="context === 'delivery'" label="Delivery address"
    ><UTextarea v-model="address" :maxlength="500" class="w-full"
  /></UFormField>
  <p v-if="context === 'delivery'" class="text-sm text-muted">
    The kitchen will confirm delivery availability and any delivery fee.
  </p>
</template>
<script setup lang="ts">
defineProps<{ context: 'collection' | 'delivery' | 'table' }>()
const name = defineModel<string>('name', { required: true })
const phone = defineModel<string>('phone', { required: true })
const address = defineModel<string>('address', { default: '' })
</script>
