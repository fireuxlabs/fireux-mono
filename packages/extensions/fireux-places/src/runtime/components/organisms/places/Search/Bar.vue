<template>
  <UInput
    v-model="internalValue"
    icon="i-lucide-search"
    placeholder="Type a place name…"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SearchBarProps {
  modelValue: string
}

const props = defineProps<SearchBarProps>()
const emit = defineEmits<(event: 'update:modelValue', value: string) => void>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>
