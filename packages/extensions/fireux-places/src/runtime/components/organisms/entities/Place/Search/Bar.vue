<template>
  <UInput
    v-model="internalValue"
    icon="i-lucide-search"
    :placeholder="placeholder"
    size="lg"
    autofocus
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface SearchBarProps {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<SearchBarProps>(), {
  placeholder: 'Type a place name…',
})
const emit = defineEmits<(event: 'update:modelValue', value: string) => void>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const placeholder = computed(() => props.placeholder)
</script>
