<template>
  <div class="richtext-wrapper">
    <label class="sr-only" for="richtext-input">Rich text</label>
    <textarea
      id="richtext-input"
      v-model="localValue"
      class="richtext-input"
      rows="6"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue: string | undefined }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localValue = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (newVal: string | undefined) => {
    if (newVal !== localValue.value) {
      localValue.value = newVal || ''
    }
  }
)

watch(localValue, (val: string) => {
  emit('update:modelValue', val)
})
</script>

<style scoped>
.richtext-wrapper {
  display: block;
}

.richtext-input {
  width: 100%;
  min-height: 180px;
  padding: calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg);
  color: var(--ui-text);
  font: inherit;
  line-height: var(--leading-normal);
  resize: vertical;
}

.richtext-input:focus {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
