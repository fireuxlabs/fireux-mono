<template>
  <ClientOnly>
    <div class="quill-wrapper">
      <QuillEditor
        v-model:content="localValue"
        content-type="html"
        theme="snow"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps<{ modelValue: string | undefined }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localValue = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  newVal => {
    if (newVal !== localValue.value) {
      localValue.value = newVal || ''
    }
  }
)

watch(localValue, val => {
  emit('update:modelValue', val)
})
</script>
