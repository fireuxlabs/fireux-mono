<template>
  <UButton
    label="Create"
    icon="i-lucide-plus"
    color="neutral"
    variant="soft"
    size="sm"
    :disabled="disabled"
    @click="emit('click')"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ click: [] }>()
</script>
