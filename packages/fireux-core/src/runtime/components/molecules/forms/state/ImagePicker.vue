<template>
  <div class="picker">
    <label :for="id" class="picker-label">{{ label }}</label>

    <!-- Hidden file input -->
    <input
      :id="id"
      ref="inputRef"
      type="file"
      accept="image/*"
      class="hidden-input"
      @change="onSelect"
    >

    <!-- Preview -->
    <div class="image-container" v-if="dataRef">
      <img :src="dataRef" :alt="`${label} preview`" />
    </div>

    <!-- Trigger -->
    <UButton icon="i-lucide-image-up" variant="subtle" @click="trigger">
      Upload
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const props = defineProps<{
  label: string
  stateKey: string
}>()

const dataRef = useStorage<string>(props.stateKey, '')
const inputRef = ref<HTMLInputElement | null>(null)
const id = `upload-${props.stateKey}`

function trigger() {
  inputRef.value?.click()
}

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    dataRef.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result
    if (typeof result === 'string') {
      dataRef.value = result // base64 image string
    }
  }
  reader.onerror = () => {
    console.error('❌ Error reading file')
    dataRef.value = ''
  }

  reader.readAsDataURL(file)

  // Clear the input so re-selecting the same file triggers change
  input.value = ''
}
</script>

<style scoped>
.hidden-input {
  display: none;
}

.picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image-container img {
  max-width: 100%;
  border-radius: var(--radius-sm);
  object-fit: cover;
}
</style>