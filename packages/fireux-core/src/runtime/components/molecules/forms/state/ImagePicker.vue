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
    />

    <!-- Preview -->
    <div class="image-container" v-if="dataRef">
      <img :src="dataRef" :alt="`${label} preview`" />

      <!-- File info overlay -->
      <div class="file-info" v-if="fileInfoRef">
        <span class="file-name">{{ fileInfoRef.name }}</span>
        <span class="file-size">{{ fileSizeText }}</span>
        <span v-if="!isValidImage" class="validation-error">
          ⚠️ File too large or invalid type
        </span>
      </div>
    </div>

    <!-- Upload trigger -->
    <div class="upload-controls">
      <UButton
        icon="i-lucide-image-up"
        variant="subtle"
        @click="trigger"
        :disabled="!isValidImage && !!fileInfoRef"
      >
        {{ dataRef ? 'Change' : 'Upload' }}
      </UButton>

      <!-- Clear button -->
      <UButton
        v-if="dataRef"
        icon="i-lucide-x"
        variant="ghost"
        color="red"
        size="sm"
        @click="
          () => {
            dataRef = ''
            fileInfoRef = null
            currentFile = null
          }
        "
      >
        Clear
      </UButton>
    </div>

    <!-- Validation message -->
    <div v-if="fileInfoRef && !isValidImage" class="validation-message">
      <UIcon name="i-lucide-alert-triangle" />
      <span
        >Image must be under 10MB and be a JPEG, PNG, WebP, or GIF file.</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStorage } from '@vueuse/core'

const props = defineProps<{
  label: string
  stateKey: string
}>()

// Store both base64 data and file metadata
const dataRef = useStorage<string>(`${props.stateKey}Data`, '')
const fileInfoRef = useStorage<{
  name: string
  size: number
  type: string
  lastModified: number
} | null>(`${props.stateKey}FileInfo`, null)

// Store the actual file in a reactive ref (not persisted)
const currentFile = ref<File | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const id = `upload-${props.stateKey}`

// Validation
const isValidImage = computed(() => {
  if (!fileInfoRef.value) return true
  const maxSize = 10 * 1024 * 1024 // 10MB
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return (
    fileInfoRef.value.size <= maxSize &&
    validTypes.includes(fileInfoRef.value.type)
  )
})

const fileSizeText = computed(() => {
  if (!fileInfoRef.value) return ''
  const sizeInMB = (fileInfoRef.value.size / (1024 * 1024)).toFixed(2)
  return `${sizeInMB}MB`
})

// Expose the file for parent components to access
defineExpose({
  getFile: () => currentFile.value,
  getDataUrl: () => dataRef.value,
  getFileInfo: () => fileInfoRef.value,
  clear: () => {
    dataRef.value = ''
    fileInfoRef.value = null
    currentFile.value = null
  },
})

function trigger() {
  inputRef.value?.click()
}

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    dataRef.value = ''
    fileInfoRef.value = null
    currentFile.value = null
    return
  }

  // Store file reference
  currentFile.value = file

  // Store file metadata
  fileInfoRef.value = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
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
    fileInfoRef.value = null
    currentFile.value = null
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

.picker-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.image-container {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid var(--ui-border);
  background: var(--ui-bg-elevated);
}

.image-container img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.file-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  font-size: 0.875rem;
  truncate: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.file-size {
  font-size: 0.75rem;
  opacity: 0.8;
}

.validation-error {
  color: var(--color-red-400);
  font-size: 0.75rem;
  font-weight: 500;
}

.upload-controls {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.validation-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--radius-sm);
  color: var(--color-red-700);
  font-size: 0.875rem;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .validation-message {
    background: var(--color-red-950);
    border-color: var(--color-red-800);
    color: var(--color-red-300);
  }
}
</style>
