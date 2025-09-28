<script setup lang="ts">
defineProps<{ modelValue: { start: Date; end: Date } }>()
const emit = defineEmits<{
  'update:modelValue': [{ start: Date; end: Date }]
}>()
function setLast7Days() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 7)
  emit('update:modelValue', { start, end })
}
</script>

<template>
  <UButton
    label="Last 7 days"
    color="neutral"
    variant="ghost"
    @click="setLast7Days"
  />
</template>
